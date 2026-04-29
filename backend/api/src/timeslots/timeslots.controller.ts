import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TimeslotsService } from './timeslots.service';

@Controller('timeslots')
export class TimeslotsController {
  constructor(private readonly timeslotsService: TimeslotsService) {}

  @Get()
  findByCondition(
    @Query('branchId') branchId: string,
    @Query('packageId') packageId: string,
    @Query('date') date: string,
  ) {
    if (branchId && packageId && date) {
      return this.timeslotsService.findByCondition(
        Number(branchId),
        Number(packageId),
        date,
      );
    }

    if (!branchId && !packageId && !date) {
      return this.timeslotsService.findAllAdmin();
    }

    throw new BadRequestException('branchId, packageId, date 為必填參數');
  }

  @Post()
  async create(
    @Body()
    body: {
      branchId: number;
      packageId: number;
      date: string;
      timeSlot: string;
      quota: number;
    },
  ) {
    const { branchId, packageId, date, timeSlot, quota } = body;

    if (
      branchId === undefined ||
      packageId === undefined ||
      !date ||
      !timeSlot ||
      quota === undefined
    ) {
      throw new BadRequestException(
        'branchId, packageId, date, timeSlot, quota 為必填欄位',
      );
    }

    return {
      message: '時段名額已成功設定',
      data: await this.timeslotsService.create({
        branchId: Number(branchId),
        packageId: Number(packageId),
        date,
        timeSlot,
        quota: Number(quota),
      }),
    };
  }

  /**
   * PATCH /api/timeslots/:id
   * 健檢中心後台：修改既有時段名額
   */
  @Patch(':id')
  async updateQuota(
    @Param('id') id: string,
    @Body()
    body: {
      quota: number;
    },
  ) {
    const slotId = Number(id);
    const quota = Number(body.quota);

    if (Number.isNaN(slotId)) {
      throw new BadRequestException('slotId 格式錯誤');
    }

    if (Number.isNaN(quota) || quota < 0) {
      throw new BadRequestException('quota 必須是大於等於 0 的數字');
    }

    const data = await this.timeslotsService.updateQuota(slotId, quota);

    return {
      message: '時段名額更新成功',
      data,
    };
  }

  /**
 * PATCH /api/timeslots/:id/status
 * 健檢中心後台：手動關閉 / 重新開放時段
 */
@Patch(':id/status')
async updateStatus(
  @Param('id') id: string,
  @Body()
  body: {
    status: 'open' | 'closed';
  },
) {
  const slotId = Number(id);

  if (Number.isNaN(slotId)) {
    throw new BadRequestException('slotId 格式錯誤');
  }

  if (body.status !== 'open' && body.status !== 'closed') {
    throw new BadRequestException('status 只能是 open 或 closed');
  }

  const data = await this.timeslotsService.updateStatus(slotId, body.status);

  return {
    message: '時段狀態更新成功',
    data,
  };
  }
}