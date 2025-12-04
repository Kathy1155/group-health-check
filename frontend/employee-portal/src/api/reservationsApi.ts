// src/api/reservationsApi.ts

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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
    birthday, // YYYY-MM-DD
  });

  const res = await fetch(
    `${API_BASE_URL}/reservations/lookup?${params.toString()}`,
    {
      method: "GET",
    }
  );

  if (!res.ok) {
    if (res.status === 404) {
      // 查無資料
      throw new Error("NOT_FOUND");
    }
    throw new Error("NETWORK_ERROR");
  }

  const data = (await res.json()) as ReservationLookupDto;
  return data;
}