import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupsService {
  // 假資料
  private mockGroups = [
    { id: 1, name: '富邦人壽年度健檢', contactName: '王小明' },
    { id: 2, name: '公司 A 員工健檢', contactName: '林美玉' },
  ];

  // 取得全部團體
  findAll() {
    return this.mockGroups;
  }

  // 取得單一團體
  findOne(id: number) {
    return this.mockGroups.find((g) => g.id === id);
  }

  // 新增團體資料
  create(data: {
    groupName: string;
    groupCode: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    status?: 'active' | 'inactive';
  }) {
    const newId = this.mockGroups.length + 1;

    const newGroup = {
      id: newId,
      name: data.groupName,
      groupCode: data.groupCode,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      status: data.status ?? 'active',
    };

    this.mockGroups.push(newGroup);
    return newGroup;
  }
}
