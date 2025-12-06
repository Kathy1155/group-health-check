// src/reservations/reservations.controller.ts - MODIFIED

import { Controller, Get, Patch, Body, Param, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ReservationsService, Reservation } from './reservations.service';
import { UpdateReservationDto } from './dto/update-reservation.dto'; // 引入 DTO

@Controller('reservations') 
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) {} // 注入 Service

    // GET 請求: 查詢所有預約
    // 路徑: GET /api/reservations
    @Get()
    findAll(): Reservation[] {
        return this.reservationsService.findAll();
    }

    // PATCH 請求: 修改單筆預約的狀態
    // 路徑: PATCH /api/reservations/:id
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    updateStatus(@Param('id') id: string, @Body() updateDto: UpdateReservationDto): { message: string, data: Reservation } {
        
        const reservationId = parseInt(id, 10);
        
        // 呼叫 Service 進行更新 (Service 會處理找不到資料的例外)
        try {
            const updatedReservation = this.reservationsService.updateStatus(reservationId, updateDto);
            return {
                message: `預約 ${reservationId} 狀態更新成功`,
                data: updatedReservation,
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                // 如果 Service 拋出 NotFoundException，這裡捕捉並處理
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }
}