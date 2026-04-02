import { API_BASE_URL } from "./client";

export type BranchItem = {
  branchId: number;
  branchName: string;
};

export type CreateGroupBody = {
  groupName: string;
  groupCode: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status?: "active" | "inactive";
  availableBranchIds: number[];
  reservationOpenStart?: string;
  reservationOpenEnd?: string;
};

function buildApiUrl(path: string) {
  const base = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // 如果 base 已經有 /api，就不要再補一次
  if (base.endsWith("/api")) {
    return `${base}${normalizedPath}`;
  }

  return `${base}/api${normalizedPath}`;
}

export async function createGroup(body: CreateGroupBody) {
  const res = await fetch(buildApiUrl("/groups"), {
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

export async function fetchBranches(): Promise<BranchItem[]> {
  const res = await fetch(buildApiUrl("/branches"));

  if (!res.ok) {
    const data = await res.text();
    throw new Error(data || "讀取院區失敗");
  }

  return res.json();
}