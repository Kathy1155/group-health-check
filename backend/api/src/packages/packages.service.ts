import { Injectable, NotFoundException } from '@nestjs/common';

export type PackageStatus = 'active' | 'inactive';

export interface PackageMock {
  id: number;
  code: string;      // 套餐代碼，例如 'A'
  name: string;      // 套餐名稱，例如 'A套餐'
  branches: string[]; // 目前可施作院區
  status: PackageStatus;
}

@Injectable()
export class PackagesService {
  // 假資料：之後可以改成連資料庫
  private mockPackages: PackageMock[] = [
    {
      id: 1,
      code: 'A',
      name: 'A套餐',
      branches: ['A院區', 'C院區'],
      status: 'active',
    },
    {
      id: 2,
      code: 'B',
      name: 'B套餐',
      branches: ['B院區'],
      status: 'inactive',
    },
    {
      id: 3,
      code: 'C',
      name: 'C套餐',
      branches: ['A院區', 'B院區'],
      status: 'active',
    },
  ];

  // 給下拉選單用，只需要名稱 + 代碼 + 狀態
  findAll() {
    return this.mockPackages.map((p) => ({
      code: p.code,
      name: p.name,
      status: p.status,
    }));
  }

  // 取得單一套餐的完整設定（院區 + 狀態）
  findSettings(code: string) {
    const pkg = this.mockPackages.find((p) => p.code === code);
    if (!pkg) {
      throw new NotFoundException('找不到此套餐');
    }
    return pkg;
  }

  // 更新院區 + 狀態
  updateSettings(
    code: string,
    data: { branches: string[]; status: PackageStatus },
  ) {
    const pkg = this.mockPackages.find((p) => p.code === code);
    if (!pkg) {
      throw new NotFoundException('找不到此套餐');
    }

    // 在這裡實際修改陣列裡的物件
    if (Array.isArray(data.branches)) {
      pkg.branches = data.branches;
    }
    if (data.status) {
      pkg.status = data.status;
    }

    console.log('更新後的套餐設定：', pkg); // 確認有被改到
    return pkg;
  }
}
