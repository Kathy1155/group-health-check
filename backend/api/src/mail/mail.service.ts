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
    lookupCode: string | null;
  }) {
    const frontendBaseUrl =
      process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
    const backendBaseUrl =
      process.env.BACKEND_BASE_URL || 'http://localhost:3000/api';

    const confirmLink = `${backendBaseUrl}/reservations/action?token=${payload.confirmToken}&action=confirm`;
    const cancelLink = `${backendBaseUrl}/reservations/action?token=${payload.cancelToken}&action=cancel`;
    const lookupLink = `${frontendBaseUrl}/reservation-lookup`;

    const html = `
      <div style="margin: 0; padding: 24px; background-color: #f4f9f9; font-family: Arial, 'Microsoft JhengHei', sans-serif; color: #1f2937; line-height: 1.8;">
        <div style="max-width: 720px; margin: 0 auto; background: #ffffff; border: 1px solid #dbe8ea; border-radius: 16px; overflow: hidden;">
          
          <div style="padding: 28px 32px; background: #e6f5f5; border-bottom: 1px solid #dbe8ea;">
            <h2 style="margin: 0; font-size: 28px; color: #007a82;">團體健檢預約通知</h2>
            <p style="margin: 10px 0 0; font-size: 16px; color: #374151;">
              ${payload.name} 您好，您的健檢預約已建立，請確認以下資訊。
            </p>
          </div>

          <div style="padding: 32px;">
            <div style="margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px; font-size: 20px; color: #111827;">預約資訊</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 16px;">
                <tr>
                  <td style="padding: 10px 0; width: 120px; color: #6b7280;">預約編號</td>
                  <td style="padding: 10px 0; color: #111827; font-weight: 600;">${payload.reservationNo}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">院區</td>
                  <td style="padding: 10px 0; color: #111827;">${payload.branchName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">套餐</td>
                  <td style="padding: 10px 0; color: #111827;">${payload.packageName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">日期</td>
                  <td style="padding: 10px 0; color: #111827;">${payload.date}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">時段</td>
                  <td style="padding: 10px 0; color: #111827;">${payload.timeSlot}</td>
                </tr>
              </table>
            </div>

            <div style="margin-bottom: 24px; padding: 20px; background: #f8fbfb; border: 1px solid #dbe8ea; border-radius: 12px;">
              <p style="margin: 0 0 8px; font-size: 15px; color: #6b7280;">預約查詢驗證碼</p>
              <p style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 3px; color: #111827;">
                ${payload.lookupCode ?? '尚未產生'}
              </p>
              <p style="margin: 12px 0 0; font-size: 15px; color: #4b5563;">
                日後若需查詢預約，請使用「身分證字號 + 查詢驗證碼」進行查詢。
              </p>
              <p style="margin: 12px 0 0;">
                <a href="${lookupLink}" target="_blank" style="color: #007a82; font-size: 15px; text-decoration: none; font-weight: 600;">
                  前往查詢預約
                </a>
              </p>
            </div>

            <div style="margin-bottom: 24px; padding: 20px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px;">
              <h3 style="margin: 0 0 10px; font-size: 18px; color: #9a3412;">重要提醒</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 15px; color: #7c2d12;">
                <li>請於 15 分鐘內完成預約確認，逾時系統將自動釋放名額。</li>
                <li>如需取消預約，請於健檢日前一天 17:00 前完成線上取消。</li>
                <li>超過期限後，請聯絡健檢中心或團體窗口協助處理。</li>
              </ul>
            </div>

            <div style="margin-bottom: 24px;">
              <h3 style="margin: 0 0 14px; font-size: 20px; color: #111827;">請點擊下方連結進行操作</h3>

              <div style="margin-bottom: 14px;">
                <a href="${confirmLink}" target="_blank" style="display: inline-block; padding: 12px 20px; background: #007a82; color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: 600;">
                  確認預約
                </a>
              </div>

              <div>
                <a href="${cancelLink}" target="_blank" style="display: inline-block; padding: 12px 20px; background: #ffffff; color: #dc2626; text-decoration: none; border: 1px solid #fecaca; border-radius: 10px; font-size: 16px; font-weight: 600;">
                  取消預約
                </a>
              </div>
            </div>

            <hr style="border: none; border-top: 1px solid #dbe8ea; margin: 28px 0;" />

            <div>
              <h3 style="margin: 0 0 10px; font-size: 18px; color: #111827;">健檢前注意事項</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 15px; color: #374151;">
                <li>請攜帶身分證件與健保卡。</li>
                <li>請依健檢規定空腹或遵照注意事項準備。</li>
                <li>若需更改或取消，請儘早處理。</li>
              </ul>
            </div>
          </div>
        </div>
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
