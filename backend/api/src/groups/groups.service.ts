import { Injectable } from '@nestjs/common';

@Injectable()
export class GroupsService {
  private mockGroups = [
    { id: 1, name: '富邦人壽年度健檢', contactName: '王小明' },
    { id: 2, name: '公司 A 員工健檢', contactName: '林美玉' },
  ];

  findAll() {
    return this.mockGroups;
  }

  findOne(id: number) {
    return this.mockGroups.find((g) => g.id === id);
  }
}