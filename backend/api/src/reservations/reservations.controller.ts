import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * GET /api/reservations
   * 健檢中心後台：查詢全部預約清單
   */
  @Get()
  findAll() {
    return this.reservationsService.findAllAdmin();
  }

  /**
   * GET /api/reservations/lookup?idNumber=xxx&birthday=yyyy-mm-dd
   * 前台查詢預約時會呼叫這支 API
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

  /**
   * PATCH /api/reservations/:id
   * 健檢中心後台：修改預約狀態
   */
  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body()
    body: {
      status: '已預約' | '已報到' | '已取消';
    },
  ) {
    const reservationId = Number(id);

    if (!body?.status) {
      throw new BadRequestException('status 為必填欄位');
    }

    if (Number.isNaN(reservationId)) {
      throw new BadRequestException('id 格式錯誤');
    }

    try {
      return {
        message: `預約 ${reservationId} 狀態更新成功`,
        data: this.reservationsService.updateStatus(
          reservationId,
          body.status,
        ),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }
}