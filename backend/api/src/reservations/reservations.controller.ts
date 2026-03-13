// backend/api/src/reservations/reservations.controller.ts
import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * GET /api/reservations/lookup?idNumber=xxx&birthday=yyyy-mm-dd
   * 前端查詢預約時會呼叫這支 API
   */
  @Get('lookup')
  lookup(
    @Query('idNumber') idNumber: string,
    @Query('birthday') birthday: string,
  ) {
    if (!idNumber || !birthday) {
      throw new BadRequestException('idNumber 與 birthday 為必填參數');
    }

    return this.reservationsService.lookupByIdAndBirthday(
      idNumber,
      birthday,
    );
  }
}