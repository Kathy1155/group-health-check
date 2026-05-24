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
    subject: '團體健檢預約驗證碼',
    html: `
      <div style="margin:0;padding:0;background:#f4f9f9;font-family:Arial,'Noto Sans TC','Microsoft JhengHei',sans-serif;color:#102a43;">
        <div style="max-width:620px;margin:0 auto;padding:32px 16px;">
          <div style="background:#ffffff;border:1px solid #dbe8ea;border-radius:24px;overflow:hidden;box-shadow:0 16px 36px rgba(15,23,42,0.08);">
            
            <div style="padding:28px 32px;background:linear-gradient(135deg,#f4f9f9 0%,#e6f5f5 100%);border-bottom:1px solid #dbe8ea;">
              <div style="display:inline-block;padding:8px 14px;margin-bottom:16px;border-radius:999px;background:#e6f5f5;color:#007a82;font-size:13px;font-weight:700;letter-spacing:0.04em;">
                線上預約服務
              </div>

              <h1 style="margin:0;color:#0f2742;font-size:28px;line-height:1.35;font-weight:800;">
                團體健檢預約驗證碼
              </h1>

              <p style="margin:12px 0 0;color:#506984;font-size:15px;line-height:1.8;">
                請使用以下驗證碼完成身分確認，並繼續進行團體健檢預約流程。
              </p>
            </div>

            <div style="padding:32px;">
              <p style="margin:0 0 18px;color:#405a75;font-size:16px;line-height:1.8;">
                您好，系統已收到您的驗證要求。請於有效時間內輸入下方 6 位數驗證碼。
              </p>

              <div style="margin:24px 0;padding:26px 20px;border-radius:20px;background:#e6f5f5;border:1px solid #b7d8db;text-align:center;">
                <p style="margin:0 0 10px;color:#506984;font-size:14px;font-weight:700;">
                  您的驗證碼
                </p>

                <div style="color:#007a82;font-size:40px;line-height:1.2;font-weight:800;letter-spacing:10px;">
                  ${otp}
                </div>
              </div>

              <div style="margin-top:22px;padding:16px 18px;border-radius:16px;background:#f8fbfb;border:1px solid #dbe8ea;">
                <p style="margin:0;color:#506984;font-size:14px;line-height:1.8;">
                  此驗證碼將於 <strong style="color:#007a82;">5 分鐘後失效</strong>。若您沒有進行團體健檢預約，請忽略此信件。
                </p>
              </div>
            </div>

            <div style="padding:18px 32px;background:#f8fbfb;border-top:1px solid #dbe8ea;">
              <p style="margin:0;color:#7a8ca3;font-size:13px;line-height:1.7;">
                本信件由團體健檢預約系統自動寄出，請勿直接回覆。
              </p>
            </div>

          </div>
        </div>
      </div>
    `,
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
    const expiresAt = Date.now() + 5 * 60 * 1000;

    this.store.set(verificationId, {
      otp,
      expiresAt,
      attemptsLeft: 5,
      groupCode,
      idNumber,
    });

    await this.sendOtpEmail(participant.email, otp);

    console.log(
      `[OTP] verificationId=${verificationId}, otp=${otp}, to=${participant.email}`,
    );

    return {
      verificationId,
      expiresAt,
    };
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
