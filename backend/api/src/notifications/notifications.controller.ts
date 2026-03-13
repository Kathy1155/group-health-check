import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('employee/notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Post('reservation-confirmation')
  sendReservationConfirmation(
    @Body()
    body: {
      reservationNo: string;
      groupName: string;
      name: string;
      idNumber: string;
      phone: string;
      date: string;
      slot: string;
    },
  ) {
    const required = ['reservationNo', 'groupName', 'name', 'idNumber', 'phone', 'date', 'slot'] as const;
    for (const k of required) {
      if (!body?.[k]) throw new BadRequestException(`${k} 為必填`);
    }

    return this.svc.sendReservationConfirmation(body);
  }
}