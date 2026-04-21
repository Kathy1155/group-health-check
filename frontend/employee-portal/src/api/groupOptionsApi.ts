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

type GroupOptionApiResponse = {
  groupId: string | number;
  branches: {
    branchId: string | number;
    branchName: string;
    packages: {
      packageId: string | number;
      packageName: string;
    }[];
  }[];
};

export async function fetchGroupOptions(
  groupId: number
): Promise<GroupOptionDto> {
  const res = await fetch(`${API_BASE_URL}/groups/${groupId}/options`);

  if (!res.ok) {
    throw new Error(`取得團體可選院區資料失敗，status = ${res.status}`);
  }

  const data = (await res.json()) as GroupOptionApiResponse;

  return {
    groupId: Number(data.groupId),
    branches: data.branches.map((branch) => ({
      branchId: Number(branch.branchId),
      branchName: branch.branchName,
      packages: branch.packages.map((pkg) => ({
        packageId: Number(pkg.packageId),
        packageName: pkg.packageName,
      })),
    })),
  };
}