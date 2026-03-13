import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // 1. 取得所有團體
  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  // 2. 用團體代碼查詢（對應前端：GET /api/groups/by-code?code=XXX）
  @Get('by-code')
  async findByCodeQuery(@Query('code') code: string) {
    const group = await this.groupsService.findByCode(code);
    if (!group) {
      throw new NotFoundException('找不到該團體代碼');
    }
    return group;
  }

  // 3. 如果你想保留舊寫法，也可以留著
  // 路徑：GET /api/groups/code/FB12345678
  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    const group = await this.groupsService.findByCode(code);
    if (!group) {
      throw new NotFoundException('找不到該團體代碼');
    }
    return group;
  }

  // 4. 取得院區套餐選項
  @Get(':id/options')
  getOptions(@Param('id') id: string) {
    return this.groupsService.findGroupOptions(+id);
  }

  // 5. 取得單一團體
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(+id);
  }

  // 6. 新增團體
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