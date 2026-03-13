import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { GroupEntity } from '../groups/group.entity';
import { GroupParticipantEntity } from '../roster/group-participant.entity';

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
  ) {}

  async requestOtp(groupCode: string, idNumber: string) {
    // 1. 先查團體
    const group = await this.groupRepo.findOne({
      where: { groupCode },
    });

    if (!group) {
      throw new BadRequestException('查無此團體代碼');
    }

    // 2. 再查這個人是否存在於該團體名冊
    const participant = await this.participantRepo.findOne({
      where: {
        groupId: group.groupId,
        idNumber,
      },
    });

    if (!participant) {
      throw new BadRequestException('資料驗證失敗');
    }

    // 3. 檢查是否有 email 可寄送 OTP
    if (!participant.email) {
      throw new BadRequestException('查無可寄送驗證碼的 email');
    }

    // 4. 產生 OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationId = randomUUID();

    this.store.set(verificationId, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attemptsLeft: 5,
      groupCode,
      idNumber,
    });

    // 目前先用 log 模擬寄送
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