import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/update-reservation.dto';
import { Res } from '@nestjs/common';
import type { Response } from 'express';

  @Controller('reservations')
  export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) {}

    /**
     * POST /api/reservations
     * 前台：建立預約 + 病史
     */
    @Post()
    create(@Body() dto: any) {
      console.log('收到 reservation dto:', dto);
      console.log('typeof dto =', typeof dto);
      console.log('dto.groupCode =', dto?.groupCode);
      console.log('dto.idNumber =', dto?.idNumber);
      console.log('dto.packageId =', dto?.packageId);
      console.log('dto.slotId =', dto?.slotId);
      console.log('dto.medicalProfile =', dto?.medicalProfile);

      if (!dto.groupCode) {
        throw new BadRequestException('groupCode 為必填欄位');
      }

      if (!dto.idNumber) {
        throw new BadRequestException('idNumber 為必填欄位');
      }

      if (dto.packageId == null) {
        throw new BadRequestException('packageId 為必填欄位');
      }

      if (dto.slotId == null) {
        throw new BadRequestException('slotId 為必填欄位');
      }

      if (!dto.medicalProfile) {
        throw new BadRequestException('medicalProfile 為必填欄位');
      }

      return this.reservationsService.createReservationWithProfile(dto);
    }

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
   * GET /api/reservations/action?token=xxx&action=confirm
   * Email 連結：確認 / 取消預約
   */
  @Get('action')
async handleReservationAction(
  @Query('token') token: string,
  @Query('action') action: 'confirm' | 'cancel',
  @Res() res: Response,
) {
  const frontendBaseUrl =
    process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

  if (!token || !action) {
    return res.redirect(
      `${frontendBaseUrl}/reservation-action-result?result=invalid`,
    );
  }

  if (action !== 'confirm' && action !== 'cancel') {
    return res.redirect(
      `${frontendBaseUrl}/reservation-action-result?result=invalid`,
    );
  }

  try {
    const result = await this.reservationsService.handleAction(token, action);

    const redirectResult =
      result.reservationStatus === 'confirmed'
        ? 'confirmed'
        : result.reservationStatus === 'cancelled'
        ? 'cancelled'
        : 'success';

    return res.redirect(
      `${frontendBaseUrl}/reservation-action-result?result=${redirectResult}`,
    );
  } catch (error: any) {
    const message = error?.message ?? '';

    if (message.includes('已確認')) {
      return res.redirect(
        `${frontendBaseUrl}/reservation-action-result?result=already-confirmed`,
      );
    }

    if (message.includes('已取消')) {
      return res.redirect(
        `${frontendBaseUrl}/reservation-action-result?result=already-cancelled`,
      );
    }

    if (message.includes('找不到')) {
      return res.redirect(
        `${frontendBaseUrl}/reservation-action-result?result=invalid`,
      );
    }

    return res.redirect(
      `${frontendBaseUrl}/reservation-action-result?result=error`,
    );
  }
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