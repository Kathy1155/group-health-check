// src/api/groupsApi.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export interface GroupDto {
  id: number;
  code: string;
  name: string;
  contactName: string;
}

export async function fetchGroupByCode(
  code: string
): Promise<GroupDto | null> {
  const params = new URLSearchParams({ code });

  const res = await fetch(`${API_BASE_URL}/groups/by-code?${params.toString()}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`查詢團體失敗，status = ${res.status}`);
  }

  return res.json();
}