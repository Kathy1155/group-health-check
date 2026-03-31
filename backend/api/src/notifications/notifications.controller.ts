import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('employee/notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Post('reservation-confirmation')
  sendReservationConfirmation(
    @Body()
    body: {
      reservationId: number;
    },
  ) {
    if (!body?.reservationId) {
      throw new BadRequestException('reservationId 為必填');
    }

    return this.svc.sendReservationConfirmation({
      reservationId: Number(body.reservationId),
    });
  }
}