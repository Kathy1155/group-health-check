import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  // 取得所有套餐（給下拉選單用）
  @Get()
  findAll(): any {
    return this.packagesService.findAll();
  }

  // 取得單一套餐目前的院區設定
  @Get(':code/settings')
  findSettings(@Param('code') code: string): any {
    return this.packagesService.findSettings(code);
  }

  // 更新某一個套餐的院區設定
  @Put(':code/settings')
  updateSettings(
    @Param('code') code: string,
    @Body()
    body: {
      branches: string[];
      status: 'active' | 'inactive';
    },
  ): any {
    return this.packagesService.updateSettings(code, body);
  }
}
