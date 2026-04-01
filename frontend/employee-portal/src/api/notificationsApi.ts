// frontend/employee-portal/src/api/notificationsApi.ts

import { API_BASE_URL } from "./config";

export type ReservationConfirmationPayload = {
  reservationId: number;
  reservationNo: string;
  groupName: string;
  name: string;
  idNumber: string;
  phone: string;
  date: string;
  slot: string;
};

/**
 * 重寄「預約確認 / 驗證信」（mock 寄信：後端印 log）
 * POST /api/employee/notifications/reservation-confirmation
 */
export async function resendReservationConfirmationEmail(
  payload: ReservationConfirmationPayload
): Promise<{ ok: boolean }> {
  const res = await fetch(
    `${API_BASE_URL}/employee/notifications/reservation-confirmation`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error("RESEND_EMAIL_FAILED");
  }

  return (await res.json()) as { ok: boolean };
}