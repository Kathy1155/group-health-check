import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendReservationActionEmail(payload: {
    to: string;
    name: string;
    reservationNo: string;
    branchName: string;
    packageName: string;
    date: string;
    timeSlot: string;
    confirmToken: string;
    cancelToken: string;
  }) {
    const frontendBaseUrl =
      process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const backendBaseUrl =
      process.env.BACKEND_BASE_URL || 'http://localhost:3000/api';

    const confirmLink = `${backendBaseUrl}/reservations/action?token=${payload.confirmToken}&action=confirm`;
    const cancelLink = `${backendBaseUrl}/reservations/action?token=${payload.cancelToken}&action=cancel`;
    const lookupLink = `${frontendBaseUrl}/reservation-lookup`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333;">
        <h2>團體健檢預約通知</h2>

        <p>${payload.name} 您好：</p>

        <p>您的健檢預約已建立，以下為預約資訊：</p>

        <ul>
          <li>預約編號：${payload.reservationNo}</li>
          <li>院區：${payload.branchName}</li>
          <li>套餐：${payload.packageName}</li>
          <li>日期：${payload.date}</li>
          <li>時段：${payload.timeSlot}</li>
        </ul>

        <p>請點擊下方連結進行操作：</p>

        <p>
          <a href="${confirmLink}" target="_blank">確認預約</a>
        </p>

        <p>
          <a href="${cancelLink}" target="_blank">取消預約</a>
        </p>

        <p>
          <a href="${lookupLink}" target="_blank">查詢預約</a>
        </p>

        <hr />

        <p>健檢前注意事項：</p>
        <ul>
          <li>請攜帶身分證件與健保卡。</li>
          <li>請依健檢規定空腹或遵照注意事項準備。</li>
          <li>若需更改或取消，請盡早處理。</li>
        </ul>
      </div>
    `;

    const info = await this.transporter.sendMail({
      from: process.env.MAIL_USER,
      to: payload.to,
      subject: '團體健檢預約通知',
      html,
    });

    console.log('預約通知信寄送成功:', info.messageId);

    return { ok: true, messageId: info.messageId };
  }
}