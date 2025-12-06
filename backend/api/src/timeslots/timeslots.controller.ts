// src/timeslots/timeslots.controller.ts - 最終修正版

import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { TimeslotsService, TimeSlot } from './timeslots.service'; // 確保引入 TimeSlot 接口
import { CreateTimeslotDto } from './dto/create-timeslot.dto'; 

// 刪除：這裡不應該有模擬資料庫陣列
// const timeSlots: CreateTimeslotDto[] = []; 

@Controller('timeslots') 
export class TimeslotsController {
    // 注入 Service (這裡面有唯一的 timeSlots 陣列)
    constructor(private readonly timeslotsService: TimeslotsService) {} 

    // POST 請求：接收前端設定時段名額的資料
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createTimeSlotDto: CreateTimeslotDto): Promise<{ message: string; data: TimeSlot; }> {
        
        // *** 修正：直接呼叫 Service 進行資料處理和儲存 ***
        const result = this.timeslotsService.create(createTimeSlotDto);
        
        return {
            message: '時段名額已成功設定 (模擬儲存)',
            data: result,
        };
    }

    // GET 請求：提供給 TimeSlotViewPage.tsx 查詢已設定的名額
    @Get()
    async findAll(): Promise<TimeSlot[]> {
        // *** 修正：直接呼叫 Service 讀取資料 ***
        return this.timeslotsService.findAll();
    }
}