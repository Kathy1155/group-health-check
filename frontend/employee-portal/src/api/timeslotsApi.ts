// src/api/timeslotsApi.ts
import { API_BASE_URL } from "./config";

export interface TimeslotDto {
  slotId: number;
  time: string;
  capacity: number;
  remaining: number;
  heldByCurrentUser?: boolean;
}

export interface TimeslotResponse {
  branchId: number;
  packageId: number;
  date: string;
  slots: TimeslotDto[];
}

export async function fetchTimeslots(
  branchId: number,
  packageId: number,
  date: string,
  currentUser?: {
    groupCode: string;
    idNumber: string;
  }
): Promise<TimeslotDto[]> {
  const params = new URLSearchParams({
    branchId: String(branchId),
    packageId: String(packageId),
    date,
  });

  if (currentUser?.groupCode && currentUser.idNumber) {
    params.set("groupCode", currentUser.groupCode);
    params.set("idNumber", currentUser.idNumber);
  }

  const res = await fetch(`${API_BASE_URL}/timeslots?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`取得可預約時段失敗，status=${res.status}`);
  }

  const data: TimeslotResponse = await res.json();
  return data.slots;
}
