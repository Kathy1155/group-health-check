// src/timeslots/timeslots.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTimeslotDto } from 'src/timeslots/dto/create-timeslot.dto';



// 接口必須與前端顯示的結構一致
export interface TimeSlot {
    date: string; 
    timeSlot: string; 
    packageType: string; 
    quota: number; 
}

@Injectable()
export class TimeslotsService {
    // 這是記憶體內儲存的陣列
    private timeSlots: TimeSlot[] = []; 

    /**
     * POST /timeslots 時呼叫
     */
    create(createTimeslotDto: CreateTimeslotDto): TimeSlot {
        // *** 修正: 這裡進行數字轉換和驗證 ***
        const quotaNumber = Number(createTimeslotDto.quota);

        if (isNaN(quotaNumber) || quotaNumber <= 0) {
            // 在 Service 或 Controller 應該拋出 NestJS 錯誤，這裡使用標準錯誤
            throw new BadRequestException('名額必須是有效的數字且大於零');
        }

        const newTimeSlot: TimeSlot = {
            ...createTimeslotDto,
            quota: quotaNumber, // 使用轉換後的數字
        };
        
        this.timeSlots.push(newTimeSlot);
        console.log(`後端成功儲存新的時段名額：`, newTimeSlot);
        return newTimeSlot;
    }

    /**
     * GET /timeslots 時呼叫，返回所有已儲存的時段名額
     */
    findAll(): TimeSlot[] {
        console.log(`後端響應 GET /timeslots 查詢。目前儲存筆數: ${this.timeSlots.length}`);
        return this.timeSlots;
    }
}