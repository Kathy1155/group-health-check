import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail-test')
export class MailTestController {
  constructor(private readonly mailService: MailService) {}

  @Post('reservation')
  async sendTestReservationMail(@Body() body: { to: string }) {
        return this.mailService.sendReservationActionEmail({
        to: body.to,
        name: '王小明',
        reservationNo: 'R20260331001',
        branchName: '中興院區',
        packageName: '在職勞工健檢（一般）',
        date: '2026-04-10',
        timeSlot: '10:00-12:00',
        confirmToken: 'test-confirm-token',
        cancelToken: 'test-cancel-token',
        });
  }
}