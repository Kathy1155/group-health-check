import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

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
}
