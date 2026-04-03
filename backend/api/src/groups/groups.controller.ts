import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
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
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): any {
    return this.groupsService.findOne(id);
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
      availablePackageIds?: number[];
      reservationStartDate?: string;
      reservationEndDate?: string;
    },
  ) {
    return this.groupsService.create(body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      groupName?: string;
      contactName?: string;
      contactPhone?: string;
      contactEmail?: string;
      status?: 'active' | 'inactive';
      availablePackageIds?: number[];
      reservationStartDate?: string;
      reservationEndDate?: string;
    },
  ) {
    return this.groupsService.update(id, body);
  }
}