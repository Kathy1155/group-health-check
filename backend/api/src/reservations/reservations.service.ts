// src/reservations/reservations.service.ts - MODIFIED

import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateReservationDto } from './dto/update-reservation.dto'; 

// 預約資料結構 (必須與前端 Reservation 介面一致)
export interface Reservation {
    id: number;
    name: string;
    idNumber: string; 
    phone: string;
    date: string; 
    timeSlot: string;
    packageType: string;
    status: string; // '已預約', '已報到', '已取消'
}

// 假資料：沿用前端的假資料，作為啟動時的初始數據 (保證有數據可供查詢)
const initialReservations: Reservation[] = [
    { id: 1, name: '林小安', idNumber: 'A123456789', phone: '0912-345-678', date: '2025-12-08', timeSlot: '8:00-10:00', packageType: 'A', status: '已預約' },
    { id: 2, name: '張育庭', idNumber: 'B987654321', phone: '0922-333-222', date: '2025-12-08', timeSlot: '10:00-12:00', packageType: 'B', status: '已報到' },
    { id: 3, name: '陳小華', idNumber: 'C100000000', phone: '0933-111-000', date: '2025-12-09', timeSlot: '8:00-10:00', packageType: 'A', status: '已取消' },
    { id: 4, name: '王大明', idNumber: 'D111222333', phone: '0944-555-666', date: '2025-12-09', timeSlot: '13:00-15:00', packageType: 'C', status: '已預約' },
    { id: 5, name: '李美美', idNumber: 'E999888777', phone: '0955-999-888', date: '2025-12-10', timeSlot: '8:00-10:00', packageType: 'D', status: '已預約' },
];

@Injectable()
export class ReservationsService {
    // 這是我們唯一的模擬資料庫
    private reservations: Reservation[] = initialReservations; 

    findAll(): Reservation[] {
        console.log(`響應 GET /reservations 查詢。總筆數: ${this.reservations.length}`);
        return this.reservations;
    }

    updateStatus(id: number, updateDto: UpdateReservationDto): Reservation {
        const index = this.reservations.findIndex(r => r.id === id);
        
        if (index === -1) {
            // 在 NestJS 中，應該拋出 NotFoundException 
            throw new NotFoundException(`找不到 ID ${id} 的預約記錄`); 
        }

        const updatedReservation = {
            ...this.reservations[index],
            status: updateDto.status, // 更新狀態
        };
        this.reservations[index] = updatedReservation;
        
        console.log(`預約 ${id} 狀態已更新為: ${updateDto.status}`);
        return updatedReservation;
    }
}