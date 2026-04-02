import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(): any {
    return this.groupsService.findAll();
  }

  @Get('by-code')
  findByCodeQuery(@Query('code') code: string): any {
    return this.groupsService.findByCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string): any {
    return this.groupsService.findOne(+id);
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
      reservationStartDate?: string;
      reservationEndDate?: string;
      availableBranches?: string[];
      status?: 'active' | 'inactive';
    },
  ): any {
    return this.groupsService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      groupName?: string;
      groupCode?: string;
      contactName?: string;
      contactPhone?: string;
      contactEmail?: string;
      reservationStartDate?: string;
      reservationEndDate?: string;
      availableBranches?: string[];
      status?: 'active' | 'inactive';
    },
  ): any {
    return this.groupsService.update(+id, body);
  }
}