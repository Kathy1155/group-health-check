// src/reservations/dto/update-reservation.dto.ts

// 這裡定義了 PATCH 請求的 Body 結構
export class UpdateReservationDto {
  // 這是新的狀態，例如: '已報到' 或 '已取消'
  status: string; 
}