// src/api/reservationsApi.ts

import { API_BASE_URL } from "./config";

export type ReservationLookupDto = {
  name: string;
  groupName: string;
  branchName: string;
  packageName: string;
  date: string;
  slot: string;
  status: string;
};

/**
 * 依「身分證字號 + 生日」查詢預約資料
 */
export async function lookupReservation(
  idNumber: string,
  birthday: string
): Promise<ReservationLookupDto> {
  const params = new URLSearchParams({
    idNumber,
    birthday,
  });

  const res = await fetch(
    `${API_BASE_URL}/reservations/lookup?${params.toString()}`,
    {
      method: "GET",
    }
  );

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("NOT_FOUND");
    }
    throw new Error("NETWORK_ERROR");
  }

  return (await res.json()) as ReservationLookupDto;
}

export type CreateReservationDto = {
  groupCode: string;
  idNumber: string;
  packageId: number;
  slotId: number;
  medicalProfile: {
    bloodType: string;
    allergies: string;
    familyHistory: string;
    chronicDiseases: string;
    medications: string;
  };
};

export type CreateReservationRes = {
  reservationId: number;
  reservationNo?: string;
  participantId: number;
  medicalProfileId: number;
  packageId: number;
  slotId: number;
  quotaStatus: string;
  reservationStatus?: string;
};

/**
 * 建立預約 + 新增/更新病史
 */
export async function createReservation(
  dto: CreateReservationDto
): Promise<CreateReservationRes> {
  const res = await fetch(`${API_BASE_URL}/reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("NOT_FOUND");
    }

    if (res.status === 400) {
      throw new Error("BAD_REQUEST");
    }

    if (res.status === 409) {
      throw new Error("CONFLICT");
    }

    const text = await res.text().catch(() => "");
    throw new Error(text || "CREATE_RESERVATION_FAILED");
  }

  return (await res.json()) as CreateReservationRes;
}