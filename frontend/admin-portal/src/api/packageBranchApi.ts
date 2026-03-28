const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export type PackageItem = {
  packageId: number | string;
  packageCode: string;
  packageName: string;
  isDisable: boolean | number;
};

export type BranchItem = {
  branchId: number | string;
  branchName: string;
};

export type PackageBranchesResponse = {
  packageId: number | string;
  packageCode: string;
  packageName: string;
  status: 'active' | 'inactive';
  selectedBranchIds: Array<number | string>;
  allSavedBranchSettings: {
    branchId: number | string;
    branchPackageStatus: 'active' | 'inactive';
  }[];
};

export async function fetchPackages(): Promise<PackageItem[]> {
  const res = await fetch(`${API_BASE_URL}/packages`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`讀取套餐列表失敗：HTTP ${res.status} ${text}`);
  }
  return res.json();
}

export async function fetchBranches(): Promise<BranchItem[]> {
  const res = await fetch(`${API_BASE_URL}/branches`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`讀取院區列表失敗：HTTP ${res.status} ${text}`);
  }
  return res.json();
}

export async function fetchPackageBranches(
  packageId: number,
): Promise<PackageBranchesResponse> {
  const res = await fetch(`${API_BASE_URL}/packages/${packageId}/branches`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`讀取套餐院區設定失敗：HTTP ${res.status} ${text}`);
  }
  return res.json();
}

export async function savePackageBranches(
  packageId: number,
  payload: {
    selectedBranchIds: number[];
    status: 'active' | 'inactive';
  },
): Promise<PackageBranchesResponse> {
  const res = await fetch(`${API_BASE_URL}/packages/${packageId}/branches`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('savePackageBranches error:', res.status, text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}