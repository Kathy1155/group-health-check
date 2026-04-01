// src/api/groupOptionsApi.ts
import { API_BASE_URL } from "./config";

export interface GroupOptionDto {
  groupId: number;
  branches: {
    branchId: number;
    branchName: string;
    packages: {
      packageId: number;
      packageName: string;
    }[];
  }[];
}

export async function fetchGroupOptions(
  groupId: number
): Promise<GroupOptionDto> {
  const res = await fetch(`${API_BASE_URL}/groups/${groupId}/options`);

  if (!res.ok) {
    throw new Error(`取得團體可選院區資料失敗，status = ${res.status}`);
  }

  return res.json();
}