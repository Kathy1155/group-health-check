import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlotEntity } from './time-slot.entity';

@Injectable()
export class TimeslotsService {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly timeSlotRepository: Repository<TimeSlotEntity>,
  ) {}

  // 🔹 查詢（給健檢中心列表用）
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
    packageType: 'A', // 先暫時寫死，之後再接 branch_package / package 資料
    quota: row.slotCapacity,
  }));
}

  // 🔹 查詢（給員工預約用）
  findByCondition(
    branchId: number,
    packageId: number,
    date: string,
  ) {
    return this.timeSlotRepository.find({
      where: {
        slotDate: date,
      },
      order: {
        slotStartTime: 'ASC',
      },
    });
  }

  // 🔹 新增（之後我們會用到）
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
      branchPackageId: 1, // ⚠️ 先寫死，之後再優化
    });

    return this.timeSlotRepository.save(newSlot);
  }
}