import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  sendReservationConfirmation(payload: {
    reservationNo: string;
    groupName: string;
    name: string;
    idNumber: string;
    phone: string;
    date: string;
    slot: string;
  }) {
    // 目前先用 log 模擬寄信（不接 DB、不接 email provider）
    const to = 'demo@example.com';

    console.log('[RESERVATION EMAIL] to=', to);
    console.log('[RESERVATION EMAIL] subject=預約確認與驗證信');
    console.log('[RESERVATION EMAIL] body=', {
      reservationNo: payload.reservationNo,
      groupName: payload.groupName,
      name: payload.name,
      idNumber: payload.idNumber,
      phone: payload.phone,
      date: payload.date,
      slot: payload.slot,
    });

    return { ok: true };
  }
}