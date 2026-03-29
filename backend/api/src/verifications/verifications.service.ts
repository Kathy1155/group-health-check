import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { GroupEntity } from '../groups/group.entity';
import { GroupParticipantEntity } from '../roster/group-participant.entity';
import * as nodemailer from 'nodemailer';

type OtpRecord = {
  otp: string;
  expiresAt: number;
  attemptsLeft: number;
  groupCode: string;
  idNumber: string;
};

@Injectable()
export class VerificationsService {
  private store = new Map<string, OtpRecord>();

  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,

    @InjectRepository(GroupParticipantEntity)
    private readonly participantRepo: Repository<GroupParticipantEntity>,

    private readonly configService: ConfigService,
  ) {}

  private async sendOtpEmail(to: string, otp: string) {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: Number(this.configService.get<string>('MAIL_PORT')),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });

    await transporter.sendMail({
      from: `"健檢預約系統" <${this.configService.get<string>('MAIL_FROM')}>`,
      to,
      subject: '團體健檢預約 OTP 驗證碼',
      text: `您的驗證碼是：${otp}\n此驗證碼將於 5 分鐘後失效。`,
    });

    console.log(`[MAIL] OTP 已寄出到 ${to}`);
  }

  async requestOtp(groupCode: string, idNumber: string) {
    const group = await this.groupRepo.findOne({
      where: { groupCode },
    });

    if (!group) {
      throw new BadRequestException('查無此團體代碼');
    }

    const participant = await this.participantRepo.findOne({
      where: {
        groupId: group.groupId,
        idNumber,
      },
    });

    if (!participant) {
      throw new BadRequestException('資料驗證失敗');
    }

    if (!participant.email) {
      throw new BadRequestException('查無可寄送驗證碼的 email');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationId = randomUUID();

    this.store.set(verificationId, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attemptsLeft: 5,
      groupCode,
      idNumber,
    });

    await this.sendOtpEmail(participant.email, otp);

    console.log(
      `[OTP] verificationId=${verificationId}, otp=${otp}, to=${participant.email}`,
    );

    return { verificationId };
  }

  verifyOtp(verificationId: string, otp: string) {
    const rec = this.store.get(verificationId);

    if (!rec) {
      throw new BadRequestException('驗證碼無效');
    }

    if (Date.now() > rec.expiresAt) {
      this.store.delete(verificationId);
      throw new BadRequestException('驗證碼已過期');
    }

    if (rec.attemptsLeft <= 0) {
      this.store.delete(verificationId);
      throw new BadRequestException('嘗試次數過多');
    }

    rec.attemptsLeft -= 1;

    if (rec.otp !== otp) {
      this.store.set(verificationId, rec);
      throw new BadRequestException('驗證碼錯誤');
    }

    this.store.delete(verificationId);

    const verificationToken = `verified:${rec.groupCode}:${rec.idNumber}:${Date.now()}`;
    return { verificationToken };
  }
}