import { Injectable } from '@nestjs/common';

export interface TimeslotItem {
  slotId: number;
  time: string;      // 顯示用字串，例如 "08:00–10:00"
  capacity: number;  // 總名額
  remaining: number; // 剩餘名額
}

@Injectable()
export class TimeslotsService {
  // 先固定兩個時段：08:00–10:00、10:00–12:00
  private baseSlots: TimeslotItem[] = [
    {
      slotId: 1,
      time: '08:00–10:00',
      capacity: 10,
      remaining: 7,
    },
    {
      slotId: 2,
      time: '10:00–12:00',
      capacity: 10,
      remaining: 4,
    },
  ];

  findByCondition(
    branchId: number,
    packageId: number,
    date: string,
  ): { branchId: number; packageId: number; date: string; slots: TimeslotItem[] } {
    const keyDate = date.substring(0, 10); // 先保留 YYYY-MM-DD，之後接資料庫會用到

    // 雛形階段：先不管 branch / package / date，
    // 統一回傳兩個固定時段，確定前端流程、畫面沒問題
    return {
      branchId,
      packageId,
      date: keyDate,
      slots: this.baseSlots,
    };
  }
}