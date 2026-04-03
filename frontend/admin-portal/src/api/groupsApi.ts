const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export type GroupStatus = "active" | "inactive";

export interface PackageItem {
  packageId: number;
  packageName: string;
}

export interface GroupDetailDto {
  id: number;
  groupName: string;
  groupCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  reservationStartDate?: string;
  reservationEndDate?: string;
  availablePackageIds?: number[];
  availablePackages?: PackageItem[];
  status: GroupStatus;
}

export interface CreateGroupPayload {
  groupName: string;
  groupCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  reservationStartDate?: string;
  reservationEndDate?: string;
  availablePackageIds?: number[];
  status?: GroupStatus;
}

export interface UpdateGroupPayload {
  groupName?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  reservationStartDate?: string;
  reservationEndDate?: string;
  availablePackageIds?: number[];
  status?: GroupStatus;
}

export async function fetchPackages(): Promise<PackageItem[]> {
  const res = await fetch(`${API_BASE_URL}/packages`);

  if (!res.ok) {
    throw new Error("讀取套餐資料失敗");
  }

  const data = await res.json();

  return (data ?? [])
    .filter((item: any) => !item.isDisable)
    .map((item: any) => ({
      packageId: Number(item.packageId),
      packageName: item.packageName,
    }));
}

export async function fetchGroupByCode(
  code: string,
): Promise<GroupDetailDto | null> {
  const params = new URLSearchParams({ code });

  const res = await fetch(`${API_BASE_URL}/groups/by-code?${params.toString()}`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`查詢團體資料失敗，status = ${res.status}`);
  }

  return res.json();
}

export async function fetchGroupById(id: number): Promise<GroupDetailDto> {
  const res = await fetch(`${API_BASE_URL}/groups/${id}`);

  if (!res.ok) {
    throw new Error(`讀取團體資料失敗，status = ${res.status}`);
  }

  return res.json();
}

export async function createGroup(
  payload: CreateGroupPayload,
): Promise<GroupDetailDto> {
  const res = await fetch(`${API_BASE_URL}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "新增團體資料失敗");
  }

  return res.json();
}

export async function updateGroup(
  id: number,
  payload: UpdateGroupPayload,
): Promise<GroupDetailDto> {
  const res = await fetch(`${API_BASE_URL}/groups/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "更新團體資料失敗");
  }

  return res.json();
}