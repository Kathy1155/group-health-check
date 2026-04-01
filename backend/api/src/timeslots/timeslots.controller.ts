import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { TimeslotsService } from './timeslots.service';

@Controller('timeslots')
export class TimeslotsController {
  constructor(private readonly timeslotsService: TimeslotsService) {}

  @Get()
  findByCondition(
    @Query('branchId') branchId: string,
    @Query('packageId') packageId: string,
    @Query('date') date: string,
  ) {
    if (branchId && packageId && date) {
      return this.timeslotsService.findByCondition(
        Number(branchId),
        Number(packageId),
        date,
      );
    }

    if (!branchId && !packageId && !date) {
      return this.timeslotsService.findAllAdmin();
    }

    throw new BadRequestException('branchId, packageId, date 為必填參數');
  }

  @Post()
  async create(
    @Body()
    body: {
      branchId: number;
      packageId: number;
      date: string;
      timeSlot: string;
      quota: number;
    },
  ) {
    const { branchId, packageId, date, timeSlot, quota } = body;

    if (
      branchId === undefined ||
      packageId === undefined ||
      !date ||
      !timeSlot ||
      quota === undefined
    ) {
      throw new BadRequestException(
        'branchId, packageId, date, timeSlot, quota 為必填欄位',
      );
    }

    return {
      message: '時段名額已成功設定',
      data: await this.timeslotsService.create({
        branchId: Number(branchId),
        packageId: Number(packageId),
        date,
        timeSlot,
        quota: Number(quota),
      }),
    };
  }
}