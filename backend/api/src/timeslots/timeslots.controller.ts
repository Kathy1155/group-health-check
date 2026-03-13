import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
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
    if (!branchId || !packageId || !date) {
      throw new BadRequestException('branchId, packageId, date 為必填參數');
    }

    return this.timeslotsService.findByCondition(
      Number(branchId),
      Number(packageId),
      date,
    );
  }
}