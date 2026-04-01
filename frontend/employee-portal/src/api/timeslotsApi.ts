// src/api/timeslotsApi.ts
import { API_BASE_URL } from "./config";

export interface TimeslotDto {
  slotId: number;
  time: string;
  capacity: number;
  remaining: number;
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
  date: string
): Promise<TimeslotDto[]> {
  const params = new URLSearchParams({
    branchId: String(branchId),
    packageId: String(packageId),
    date,
  });

  const res = await fetch(`${API_BASE_URL}/timeslots?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`取得可預約時段失敗，status=${res.status}`);
  }

  const data: TimeslotResponse = await res.json();
  return data.slots;
}