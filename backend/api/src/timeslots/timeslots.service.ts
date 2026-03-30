import { Injectable } from '@nestjs/common';
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

    return rows.map((row) => ({
      date: row.slotDate,
      timeSlot: `${row.slotStartTime}-${row.slotEndTime}`,
      packageType: 'A',
      quota: row.slotCapacity,
    }));
  }

  // 員工前台：依 branchId / packageId / date 查詢真正可預約時段
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
    date: string;
    timeSlot: string;
    packageType: string;
    quota: number;
  }) {
    const [start, end] = data.timeSlot.split('-');

    const newSlot = this.timeSlotRepository.create({
      slotDate: data.date,
      slotStartTime: start,
      slotEndTime: end,
      slotCapacity: data.quota,
      slotReservedCount: 0,
      slotStatus: 'open',
      branchPackageId: 1,
    });

    return this.timeSlotRepository.save(newSlot);
  }
}