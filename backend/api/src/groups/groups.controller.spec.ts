// backend/api/src/groups/groups.controller.ts
import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  // GET /api/groups/by-code?code=FUBON2025
  @Get('by-code')
  findByCode(@Query('code') code: string) {
    const group = this.groupsService.findByCode(code);
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }
}