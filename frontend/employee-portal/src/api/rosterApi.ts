// src/api/rosterApi.ts
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export type RosterProfileDto = {
  groupCode: string;
  name: string;
  idNumber: string;
  phone: string;
  birthday: string; // YYYY-MM-DD
};

/**
 * 用「團體代碼 + 身分證字號」查詢團體名冊中的員工基本資料
 * ⚠️ URL 請與後端 roster.controller.ts 完全一致
 */
export async function fetchRosterProfile(
  groupCode: string,
  idNumber: string
): Promise<RosterProfileDto | null> {
  const params = new URLSearchParams({ groupCode, idNumber });

  const res = await fetch(
    `${API_BASE_URL}/roster/by-key?${params.toString()}`,
    {
      method: "GET",
    }
  );

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`查詢名冊資料失敗，status = ${res.status}`);
  }

  return (await res.json()) as RosterProfileDto;
}