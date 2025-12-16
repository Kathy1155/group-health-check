// backend/api/src/reservations/reservations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';

export type ReservationLookupResult = {
  name: string;
  groupName: string;
  branchName: string;
  packageName: string;
  date: string;
  slot: string;
  status: string;
};

@Injectable()
export class ReservationsService {
  // 目前先用假資料，之後可以改成查資料庫
  private mockReservations: {
    idNumber: string;
    birthday: string; // YYYY-MM-DD
    data: ReservationLookupResult;
  }[] = [
    {
      idNumber: 'A123456789',
      birthday: '2018-07-03',
      data: {
        name: '王小明',
        groupName: '富邦人壽年度健檢',
        branchName: '中興院區',
        packageName: '基礎健檢 A',
        date: '2025-12-10',
        slot: '08:00–10:00',
        status: '已預約',
      },
    },
  ];

  // 查詢：用 身分證字號 + 生日 找預約資料
  lookupByIdAndBirthday(
    idNumber: string,
    birthday: string,
  ): ReservationLookupResult {
    const found = this.mockReservations.find(
      (r) => r.idNumber === idNumber && r.birthday === birthday,
    );

    if (!found) {
      throw new NotFoundException('查無預約資料');
    }

    return found.data;
  }
}