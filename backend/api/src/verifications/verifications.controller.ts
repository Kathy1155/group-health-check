import { Body, Controller, Post } from '@nestjs/common';
import { VerificationsService } from './verifications.service';

@Controller('employee/verifications')
export class VerificationsController {
  constructor(private readonly svc: VerificationsService) {}

  @Post('request')
  request(@Body() body: { groupCode: string; idNumber: string }) {
    return this.svc.requestOtp(body.groupCode, body.idNumber);
  }

  @Post('verify')
  verify(@Body() body: { verificationId: string; otp: string }) {
    return this.svc.verifyOtp(body.verificationId, body.otp);
  }
}