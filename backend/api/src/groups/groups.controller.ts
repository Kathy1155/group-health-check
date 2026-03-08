import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

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
}