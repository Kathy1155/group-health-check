import { API_BASE_URL } from "./client";

export type CreateGroupBody = {
  groupName: string;
  groupCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status?: "active" | "inactive";
};

export async function createGroup(body: CreateGroupBody) {
  const res = await fetch(`${API_BASE_URL}/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (res.status === 409) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "團體代碼已存在");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "新增失敗");
  }

  return res.json();
}