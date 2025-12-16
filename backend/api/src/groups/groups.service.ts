// backend/api/src/groups/groups.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupsService {
  private mockGroups = [
    {
      id: 1,
      code: 'FB12345678',           // 2 碼公司縮寫 + 8 碼統編
      name: '富邦人壽年度健檢',
      contactName: '王小明',
    },
    {
      id: 2,
      code: 'CA87654321',
      name: '公司 A 員工健檢',
      contactName: '林美玉',
    },
  ];

  findAll() {
    return this.mockGroups;
  }

  findOne(id: number) {
    return this.mockGroups.find((g) => g.id === id);
  }

  findByCode(code: string) {
    return this.mockGroups.find((g) => g.code === code);
  }

  // ⭐⭐⭐ 在這裡新增「可預約院區 + 套餐」的假資料 API
findGroupOptions(groupId: number) {
  // 先定義五種套餐
  const packages = {
    A: { packageId: 101, packageName: '健檢套餐 A' },
    B: { packageId: 102, packageName: '健檢套餐 B' },
    C: { packageId: 103, packageName: '健檢套餐 C' },
    D: { packageId: 104, packageName: '健檢套餐 D' },
    E: { packageId: 105, packageName: '健檢套餐 E' },
  };

  return {
    groupId,
    branches: [
      {
        branchId: 1,
        branchName: '忠孝院區',
        // A, B, E
        packages: [packages.A, packages.B, packages.E],
      },
      {
        branchId: 2,
        branchName: '仁愛院區',
        // A, B, C, D
        packages: [packages.A, packages.B, packages.C, packages.D],
      },
      {
        branchId: 3,
        branchName: '和平婦幼院區',
        // A, C, E
        packages: [packages.A, packages.C, packages.E],
      },
      {
        branchId: 4,
        branchName: '中興院區',
        // B, D, E
        packages: [packages.B, packages.D, packages.E],
      },
      {
        branchId: 5,
        branchName: '陽明院區',
        // B, D
        packages: [packages.B, packages.D],
      },
      {
        branchId: 6,
        branchName: '松德院區',
        // C, D
        packages: [packages.C, packages.D],
      },
      {
        branchId: 7,
        branchName: '林森中醫院區',
        // C, D, E
        packages: [packages.C, packages.D, packages.E],
      },
    ],
  };
}

}