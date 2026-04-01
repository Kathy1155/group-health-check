import { BadRequestException, Injectable } from '@nestjs/common';
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

  // 健檢中心後台列表
  async findAllAdmin() {
    const rows = await this.timeSlotRepository.find({
      order: {
        slotDate: 'ASC',
        slotStartTime: 'ASC',
      },
    });

    const branchPackageIds = [...new Set(rows.map((row) => row.branchPackageId))];

    const branchPackages = await this.branchPackageRepository.find({
      where: branchPackageIds.map((id) => ({ branchPackageId: id })),
      relations: ['package', 'branch'],
    });

    const branchPackageMap = new Map(
      branchPackages.map((item) => [Number(item.branchPackageId), item]),
    );

    return rows.map((row) => {
      const branchPackage = branchPackageMap.get(Number(row.branchPackageId));

      return {
        date: row.slotDate,
        timeSlot: `${row.slotStartTime}-${row.slotEndTime}`,
        packageType: branchPackage?.package?.packageName ?? '未知套餐',
        packageId: branchPackage?.packageId ?? null,
        branchName: branchPackage?.branch?.branchName ?? '未知院區',
        branchId: branchPackage?.branchId ?? null,
        quota: row.slotCapacity,
      };
    });
  }

  // 員工前台查詢
  async findByCondition(
    branchId: number,
    packageId: number,
    date: string,
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

    const branchPackage = await this.branchPackageRepository.findOne({
      where: {
        branchId: data.branchId,
        packageId: data.packageId,
        branchPackageStatus: 'open',
      },
    });

    if (!branchPackage) {
      throw new Error('找不到對應的院區與套餐設定（branch_package）');
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
}