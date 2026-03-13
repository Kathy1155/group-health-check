import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

<<<<<<< Updated upstream
  // 用團體代碼查詢（要放在 :id 前面）
  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.groupsService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(Number(id));
  }

  @Post()
  create(
    @Body()
    body: {
      groupName: string;
      groupCode: string;
      contactName: string;
      contactPhone: string;
      contactEmail: string;
      status?: 'active' | 'inactive';
    },
  ) {
    return this.groupsService.create(body);
  }
=======
  // ✅ 先放比較「明確」的路徑
  // GET /api/groups/by-code?code=FUBON2025
  @Get('by-code')
  findByCode(@Query('code') code: string) {
    const group = this.groupsService.findByCode(code);
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  @Get(':id/options')
findGroupOptions(@Param('id') id: string) {
  return this.groupsService.findGroupOptions(+id);
}

  // ✅ 再放會吃掉所有字串的「參數路徑」
  // GET /api/groups/1
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }
>>>>>>> Stashed changes
}