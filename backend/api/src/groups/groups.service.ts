import { Injectable, NotFoundException } from '@nestjs/common';

type GroupStatus = 'active' | 'inactive';

interface GroupMock {
  id: number;
  name: string;        // 團體名稱
  groupCode: string;   // 團體代碼
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: GroupStatus;
}

@Injectable()
export class GroupsService {
  private mockGroups: GroupMock[] = [
    {
      id: 1,
      name: '富邦人壽年度健檢',
      groupCode: 'A0001',
      contactName: '王小明',
      contactPhone: '0911111111',
      contactEmail: 'fubon@example.com',
      status: 'active',
    },
    {
      id: 2,
      name: '公司A 員工健檢',
      groupCode: 'B0001',
      contactName: '林美玉',
      contactPhone: '0922222222',
      contactEmail: 'companya@example.com',
      status: 'active',
    },
  ];

  findAll() {
    return this.mockGroups;
  }

  findOne(id: number) {
    return this.mockGroups.find((g) => g.id === id);
  }

  // 新增團體資料（給「新增團體資料」頁面用）
  create(data: {
    groupName: string;
    groupCode: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    status?: GroupStatus;
  }) {
    const newId = this.mockGroups.length + 1;

    const newGroup: GroupMock = {
      id: newId,
      name: data.groupName,
      groupCode: data.groupCode,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      status: data.status ?? 'active',
    };

    this.mockGroups.push(newGroup);   // ← 這裡把新團體加進來
    return newGroup;
  }

  // 依團體代碼查詢（給上傳名冊 Step1）
  findByCode(code: string) {
    const found = this.mockGroups.find((g) => g.groupCode === code);
    if (!found) {
      throw new NotFoundException('查無此團體代碼');
    }
    return found;
  }
}
