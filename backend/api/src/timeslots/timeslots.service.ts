import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlotEntity } from './time-slot.entity';
import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';

@Injectable()
export class TimeslotsService {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly timeSlotRepository: Repository<TimeSlotEntity>,

    @InjectRepository(BranchPackageEntity)
    private readonly branchPackageRepository: Repository<BranchPackageEntity>,
  ) {}

  private isSlotEnded(slot: TimeSlotEntity) {
    const dateText = String(slot.slotDate).slice(0, 10);
    const endTimeText = String(slot.slotEndTime).slice(0, 5);
    const slotEndDateTime = new Date(`${dateText}T${endTimeText}:00`);

    return slotEndDateTime.getTime() < Date.now();
  }

  // 健檢中心後台列表
  async findAllAdmin() {
    const rows = await this.timeSlotRepository.find({
      order: {
        slotDate: 'ASC',
        slotStartTime: 'ASC',
      },
    });

    const branchPackageIds = [...new Set(rows.map((row) => row.branchPackageId))];

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
  async findByCondition(branchId: number, packageId: number, date: string) {
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

    const rows = await this.timeSlotRepository.find({
      where: {
        slotDate: date,
        branchPackageId: branchPackage.branchPackageId,
        slotStatus: 'open',
      },
      order: {
        slotStartTime: 'ASC',
      },
    });

    const slots = rows
      .filter((row) => !this.isSlotEnded(row))
      .map((row) => {
        const remaining = row.slotCapacity - row.slotReservedCount;

        return {
          slotId: row.slotId,
          time: `${row.slotStartTime}-${row.slotEndTime}`,
          capacity: row.slotCapacity,
          remaining,
        };
      })
      .filter((slot) => slot.remaining > 0);

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
    const branchPackage = await this.branchPackageRepository.findOne({
      where: {
        branchId: data.branchId,
        packageId: data.packageId,
      },
    });

    if (!branchPackage) {
      throw new BadRequestException('找不到對應的院區＋套餐設定(branch_package)');
    }

    const [start, end] = data.timeSlot.split('-');

    if (!start || !end) {
      throw new BadRequestException('timeSlot 格式錯誤，應為 開始時間-結束時間');
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
}