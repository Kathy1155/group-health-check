import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlotEntity } from './time-slot.entity';
import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';
import { GroupEntity } from '../groups/group.entity';
import { GroupParticipantEntity } from '../roster/group-participant.entity';
import { ReservationEntity } from '../reservations/entities/reservation.entity';

@Injectable()
export class TimeslotsService {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly timeSlotRepository: Repository<TimeSlotEntity>,

    @InjectRepository(BranchPackageEntity)
    private readonly branchPackageRepository: Repository<BranchPackageEntity>,

    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,

    @InjectRepository(GroupParticipantEntity)
    private readonly participantRepository: Repository<GroupParticipantEntity>,

    @InjectRepository(ReservationEntity)
    private readonly reservationRepository: Repository<ReservationEntity>,
  ) {}

  private isSlotEnded(slot: TimeSlotEntity) {
    const dateText = String(slot.slotDate).slice(0, 10);
    const endTimeText = String(slot.slotEndTime).slice(0, 5);
    const slotEndDateTime = new Date(`${dateText}T${endTimeText}:00`);

    return slotEndDateTime.getTime() < Date.now();
  }

  private async findActiveHeldSlotId(groupCode?: string, idNumber?: string) {
    if (!groupCode || !idNumber) {
      return null;
    }

    const group = await this.groupRepository.findOne({
      where: { groupCode },
    });

    if (!group) {
      return null;
    }

    const participant = await this.participantRepository.findOne({
      where: {
        groupId: group.groupId,
        idNumber,
      },
    });

    if (!participant) {
      return null;
    }

    const reservation = await this.reservationRepository.findOne({
      where: {
        participantId: participant.groupParticipantId,
        reservationStatus: 'pending',
      },
      order: { reservationId: 'DESC' },
    });

    if (
      !reservation ||
      reservation.confirmToken ||
      !reservation.confirmTokenExpiresAt ||
      new Date(reservation.confirmTokenExpiresAt) <= new Date()
    ) {
      return null;
    }

    return Number(reservation.slotId);
  }

  // 健檢中心後台列表
  async findAllAdmin() {
    const rows = await this.timeSlotRepository.find({
      order: {
        slotDate: 'ASC',
        slotStartTime: 'ASC',
      },
    });

    const branchPackageIds = [
      ...new Set(rows.map((row) => row.branchPackageId)),
    ];

    const branchPackages =
      branchPackageIds.length > 0
        ? await this.branchPackageRepository.find({
            where: branchPackageIds.map((id) => ({ branchPackageId: id })),
            relations: ['package', 'branch'],
          })
        : [];

    const branchPackageMap = new Map(
      branchPackages.map((item) => [Number(item.branchPackageId), item]),
    );

    return rows.map((row) => {
      const branchPackage = branchPackageMap.get(Number(row.branchPackageId));
      const isEnded = this.isSlotEnded(row);

      return {
        slotId: row.slotId,
        date: row.slotDate,
        timeSlot: `${row.slotStartTime}-${row.slotEndTime}`,
        packageType: branchPackage?.package?.packageName ?? '未知套餐',
        packageId: branchPackage?.packageId ?? null,
        branchName: branchPackage?.branch?.branchName ?? '未知院區',
        branchId: branchPackage?.branchId ?? null,
        quota: row.slotCapacity,
        reservedCount: row.slotReservedCount,
        remaining: row.slotCapacity - row.slotReservedCount,
        status: isEnded ? 'ended' : row.slotStatus,
      };
    });
  }

  // 員工前台查詢
  async findByCondition(
    branchId: number,
    packageId: number,
    date: string,
    groupCode?: string,
    idNumber?: string,
  ) {
    const branchPackage = await this.branchPackageRepository.findOne({
      where: {
        branchId,
        packageId,
      },
    });

    if (!branchPackage) {
      return {
        branchId,
        packageId,
        date,
        slots: [],
      };
    }

    const heldSlotId = await this.findActiveHeldSlotId(groupCode, idNumber);

    const rows = await this.timeSlotRepository.find({
      where: {
        slotDate: date,
        branchPackageId: branchPackage.branchPackageId,
      },
      order: {
        slotStartTime: 'ASC',
      },
    });

    const slots = rows
      .filter((row) => !this.isSlotEnded(row))
      .filter(
        (row) =>
          row.slotStatus === 'open' || Number(row.slotId) === heldSlotId,
      )
      .map((row) => {
        const heldByCurrentUser = Number(row.slotId) === heldSlotId;
        const remaining = heldByCurrentUser
          ? Math.max(row.slotCapacity - row.slotReservedCount, 1)
          : row.slotCapacity - row.slotReservedCount;

        return {
          slotId: row.slotId,
          time: `${row.slotStartTime}-${row.slotEndTime}`,
          capacity: row.slotCapacity,
          remaining,
          heldByCurrentUser,
        };
      })
      .filter((slot) => slot.remaining > 0 || slot.heldByCurrentUser);

    return {
      branchId,
      packageId,
      date,
      slots,
    };
  }

  // 健檢中心後台新增
  async create(data: {
    branchId: number;
    packageId: number;
    date: string;
    timeSlot: string;
    quota: number;
  }) {
    if (!Number.isInteger(data.branchId) || data.branchId <= 0) {
      throw new BadRequestException('branchId 必須是大於 0 的整數');
    }

    if (!Number.isInteger(data.packageId) || data.packageId <= 0) {
      throw new BadRequestException('packageId 必須是大於 0 的整數');
    }

    if (!data.date) {
      throw new BadRequestException('date 為必填欄位');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(`${data.date}T00:00:00`);

    if (selectedDate < today) {
      throw new BadRequestException('不能設定已經過去的日期');
    }

    if (!data.timeSlot) {
      throw new BadRequestException('timeSlot 為必填欄位');
    }

    if (!Number.isInteger(data.quota) || data.quota <= 0) {
      throw new BadRequestException('quota 必須是大於 0 的整數');
    }

    const branchPackage = await this.branchPackageRepository.findOne({
      where: {
        branchId: data.branchId,
        packageId: data.packageId,
      },
    });

    if (!branchPackage) {
      throw new BadRequestException('找不到對應的院區＋套餐設定(branch_package)');
    }

    const [start, end] = data.timeSlot.split('-').map((item) => item.trim());

    if (!start || !end) {
      throw new BadRequestException('timeSlot 格式錯誤，應為 開始時間-結束時間');
    }

    const existingSlot = await this.timeSlotRepository.findOne({
      where: {
        slotDate: data.date,
        slotStartTime: start,
        slotEndTime: end,
        branchPackageId: branchPackage.branchPackageId,
      },
    });

    if (existingSlot) {
    throw new BadRequestException(
    '此院區、套餐、日期與時段已設定過名額；若要修改名額，請至「時段名額查詢」頁面進行修改',
    );
    }
    

    const newSlot = this.timeSlotRepository.create({
      slotDate: data.date,
      slotStartTime: start,
      slotEndTime: end,
      slotCapacity: data.quota,
      slotReservedCount: 0,
      slotStatus: 'open',
      branchPackageId: branchPackage.branchPackageId,
    });

    return this.timeSlotRepository.save(newSlot);
  }

  // 健檢中心後台修改既有時段名額
  async updateQuota(slotId: number, quota: number) {
    const slot = await this.timeSlotRepository.findOne({
      where: { slotId },
    });

    if (!slot) {
      throw new NotFoundException('找不到此時段資料');
    }

    if (this.isSlotEnded(slot)) {
      throw new BadRequestException('已結束的時段不可修改名額');
    }

    if (!Number.isInteger(quota) || quota < 0) {
      throw new BadRequestException('quota 必須是大於等於 0 的整數');
    }

    if (quota < slot.slotReservedCount) {
      throw new BadRequestException(
        `名額不可小於已預約人數，目前已預約 ${slot.slotReservedCount} 人`,
      );
    }

    slot.slotCapacity = quota;

    if (slot.slotCapacity <= slot.slotReservedCount) {
      slot.slotStatus = 'full';
    } else {
      slot.slotStatus = 'open';
    }

    return this.timeSlotRepository.save(slot);
  }

  // 健檢中心後台手動關閉 / 重新開放時段
  async updateStatus(slotId: number, status: 'open' | 'closed') {
    const slot = await this.timeSlotRepository.findOne({
      where: { slotId },
    });

    if (!slot) {
      throw new NotFoundException('找不到此時段資料');
    }

    if (this.isSlotEnded(slot)) {
      throw new BadRequestException('已結束的時段不可修改狀態');
    }

    if (status === 'open') {
      slot.slotStatus =
        slot.slotReservedCount >= slot.slotCapacity ? 'full' : 'open';
    } else {
      slot.slotStatus = 'closed';
    }

    return this.timeSlotRepository.save(slot);
  }
}
