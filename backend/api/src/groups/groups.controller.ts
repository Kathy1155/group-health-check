import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
