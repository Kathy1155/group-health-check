import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

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

  // 先用假名冊，之後再換成 roster/db
  private mockRoster = [
    { groupCode: "FB12345678", idNumber: "A123456789", email: "demo@example.com" },
  ];

  requestOtp(groupCode: string, idNumber: string) {
    const found = this.mockRoster.find(
      (p) => p.groupCode === groupCode && p.idNumber === idNumber,
    );

    if (!found) {
      throw new BadRequestException("資料驗證失敗");
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

    // 先用 log 當作「寄信」方便你測試
    console.log(`[OTP] verificationId=${verificationId}, otp=${otp}, to=${found.email}`);

    return { verificationId };
  }

  verifyOtp(verificationId: string, otp: string) {
    const rec = this.store.get(verificationId);
    if (!rec) throw new BadRequestException("驗證碼無效");
    if (Date.now() > rec.expiresAt) {
      this.store.delete(verificationId);
      throw new BadRequestException("驗證碼已過期");
    }
    if (rec.attemptsLeft <= 0) {
      this.store.delete(verificationId);
      throw new BadRequestException("嘗試次數過多");
    }

    rec.attemptsLeft -= 1;

    if (rec.otp !== otp) {
      this.store.set(verificationId, rec);
      throw new BadRequestException("驗證碼錯誤");
    }

    this.store.delete(verificationId);

    // 暫時回傳簡單 token（下學期換 JWT）
    const verificationToken = `verified:${rec.groupCode}:${rec.idNumber}:${Date.now()}`;
    return { verificationToken };
  }
}