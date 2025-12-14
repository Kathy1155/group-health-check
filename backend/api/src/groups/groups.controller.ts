import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(): any {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): any {
    return this.groupsService.findOne(+id);
  }

  // 新增：用團體代碼查詢
  @Get('code/:code')
  findByCode(@Param('code') code: string): any {
    return this.groupsService.findByCode(code);
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
  ): any {
    return this.groupsService.create(body);
  }
}
