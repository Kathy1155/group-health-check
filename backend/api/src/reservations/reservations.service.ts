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

export type AdminReservation = {
  id: number;
  name: string;
  idNumber: string;
  phone: string;
  date: string;
  timeSlot: string;
  packageType: string;
  status: '已預約' | '已報到' | '已取消';
};

@Injectable()
export class ReservationsService {
  // 前台查詢用假資料
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

  // 健檢中心後台清單用假資料
  private adminReservations: AdminReservation[] = [
    {
      id: 1,
      name: '林小安',
      idNumber: 'A123456789',
      phone: '0912-345-678',
      date: '2025-12-08',
      timeSlot: '8:00-10:00',
      packageType: 'A',
      status: '已預約',
    },
    {
      id: 2,
      name: '張育庭',
      idNumber: 'B987654321',
      phone: '0922-333-222',
      date: '2025-12-08',
      timeSlot: '10:00-12:00',
      packageType: 'B',
      status: '已報到',
    },
    {
      id: 3,
      name: '陳小華',
      idNumber: 'C100000000',
      phone: '0933-111-000',
      date: '2025-12-09',
      timeSlot: '8:00-10:00',
      packageType: 'A',
      status: '已取消',
    },
    {
      id: 4,
      name: '王大明',
      idNumber: 'D111222333',
      phone: '0944-555-666',
      date: '2025-12-09',
      timeSlot: '13:00-15:00',
      packageType: 'C',
      status: '已預約',
    },
    {
      id: 5,
      name: '李美美',
      idNumber: 'E999888777',
      phone: '0955-999-888',
      date: '2025-12-10',
      timeSlot: '8:00-10:00',
      packageType: 'D',
      status: '已預約',
    },
  ];

  // 前台查詢：用 身分證字號 + 生日 找預約資料
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

  // 健檢中心後台：取得所有預約
  findAllAdmin(): AdminReservation[] {
    return this.adminReservations;
  }

  // 健檢中心後台：更新預約狀態
  updateStatus(
    id: number,
    status: '已預約' | '已報到' | '已取消',
  ): AdminReservation {
    const index = this.adminReservations.findIndex((r) => r.id === id);

    if (index === -1) {
      throw new NotFoundException(`找不到 ID ${id} 的預約紀錄`);
    }

    this.adminReservations[index] = {
      ...this.adminReservations[index],
      status,
    };

    return this.adminReservations[index];
  }
}