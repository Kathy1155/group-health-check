import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RosterService } from './roster.service';

@Controller('roster')
export class RosterController {
  constructor(private readonly rosterService: RosterService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Body('groupCode') groupCode: string,
  ) {
    if (!groupCode) {
      throw new BadRequestException('請提供團體代碼');
    }

    if (!file) {
      throw new BadRequestException('請上傳 CSV 檔案');
    }

    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('僅接受 CSV 檔案');
    }

    return this.rosterService.importCsv(groupCode, file);
  }
}