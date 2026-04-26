import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { CreateReservationDto } from './dto/update-reservation.dto';
import { HoldReservationDto } from './dto/hold-reservation.dto';
import { ReservationEntity } from './entities/reservation.entity';
import { MedicalProfileEntity } from './entities/medical-profile.entity';

import { GroupEntity } from '../groups/group.entity';
import { GroupParticipantEntity } from '../roster/group-participant.entity';
import { TimeSlotEntity } from '../timeslots/time-slot.entity';
import { MailService } from '../mail/mail.service';

import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';
import { HospitalBranchEntity } from '../branches/entities/hospital-branch.entity';
import { HealthExaminationPackageEntity } from '../packages/entities/health-examination-package.entity';

import { Cron } from '@nestjs/schedule';

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
  branchName: string;
  status: '已預約' | '已報到' | '已取消';
};

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly reservationRepo: Repository<ReservationEntity>,

    @InjectRepository(MedicalProfileEntity)
    private readonly medicalProfileRepo: Repository<MedicalProfileEntity>,

    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,

    @InjectRepository(GroupParticipantEntity)
    private readonly participantRepo: Repository<GroupParticipantEntity>,

    @InjectRepository(TimeSlotEntity)
    private readonly timeSlotRepo: Repository<TimeSlotEntity>,

    @InjectRepository(BranchPackageEntity)
    private readonly branchPackageRepo: Repository<BranchPackageEntity>,

    @InjectRepository(HospitalBranchEntity)
    private readonly branchRepo: Repository<HospitalBranchEntity>,

    @InjectRepository(HealthExaminationPackageEntity)
    private readonly packageRepo: Repository<HealthExaminationPackageEntity>,

    private readonly mailService: MailService,
  ) {}

  private generateLookupCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

private async createUniqueLookupCode(): Promise<string> {
  while (true) {
    const code = this.generateLookupCode(8);
    const existed = await this.reservationRepo.findOne({
      where: { lookupCode: code },
    });

    if (!existed) {
      return code;
    }
  }
}


  async holdReservation(dto: HoldReservationDto) {
  const group = await this.groupRepo.findOne({
    where: { groupCode: dto.groupCode },
  });

  if (!group) {
    throw new NotFoundException('找不到團體資料');
  }

  const participant = await this.participantRepo.findOne({
    where: {
      groupId: group.groupId,
      idNumber: dto.idNumber,
    },
  });

  if (!participant) {
    throw new NotFoundException('找不到團體名冊資料');
  }

  const existingPending = await this.reservationRepo.findOne({
    where: {
      participantId: participant.groupParticipantId,
      reservationStatus: 'pending',
    },
    order: { reservationId: 'DESC' },
  });

  if (
    existingPending &&
    existingPending.confirmTokenExpiresAt &&
    new Date(existingPending.confirmTokenExpiresAt) > new Date()
  ) {
    return {
      message: '已有尚未完成的待確認預約',
      reservationId: existingPending.reservationId,
      slotId: existingPending.slotId,
      reservationStatus: existingPending.reservationStatus,
      quotaStatus: existingPending.quotaStatus,
      expiresAt: existingPending.confirmTokenExpiresAt,
    };
  }

  const slot = await this.timeSlotRepo.findOne({
    where: { slotId: dto.slotId },
  });

  if (!slot) {
    throw new NotFoundException('找不到預約時段');
  }

  if (slot.slotStatus === 'closed') {
    throw new BadRequestException('此時段尚未開放預約');
  }

  if (
    slot.slotStatus === 'full' ||
    slot.slotReservedCount >= slot.slotCapacity
  ) {
    throw new BadRequestException('此時段已滿額');
  }

  const branchPackage = await this.branchPackageRepo.findOne({
    where: { branchPackageId: slot.branchPackageId },
  });

  if (!branchPackage) {
    throw new NotFoundException('找不到院區套餐資料');
  }

  const holdExpireMinutes = 15;
  const expiresAt = new Date(Date.now() + holdExpireMinutes * 60 * 1000);
  const lookupCode = await this.createUniqueLookupCode();

  const reservation = this.reservationRepo.create({
    participantId: participant.groupParticipantId,
    packageId: branchPackage.packageId,
    slotId: dto.slotId,
    medicalProfileId: null,
    quotaStatus: 'pending',
    confirmToken: null,
    confirmTokenExpiresAt: expiresAt,
    cancelToken: null,
    cancelTokenExpiresAt: expiresAt,
    lookupCode,
    reservationStatus: 'pending',
  });

  await this.reservationRepo.save(reservation);

  slot.slotReservedCount += 1;

  if (slot.slotReservedCount >= slot.slotCapacity) {
    slot.slotStatus = 'full';
  }

  await this.timeSlotRepo.save(slot);

  return {
    message: '時段名額已暫時保留',
    reservationId: reservation.reservationId,
    participantId: participant.groupParticipantId,
    packageId: branchPackage.packageId,
    slotId: reservation.slotId,
    quotaStatus: reservation.quotaStatus,
    reservationStatus: reservation.reservationStatus,
    expiresAt,
  };
}

async createReservationWithProfile(dto: CreateReservationDto) {
  const formatTime = (value: string) => String(value).slice(0, 5);

  const group = await this.groupRepo.findOne({
    where: { groupCode: dto.groupCode },
  });

  if (!group) {
    throw new NotFoundException('找不到團體資料');
  }

  const participant = await this.participantRepo.findOne({
    where: {
      groupId: group.groupId,
      idNumber: dto.idNumber,
    },
  });

  if (!participant) {
    throw new NotFoundException('找不到團體名冊資料');
  }

  const reservation = await this.reservationRepo.findOne({
    where: { reservationId: Number(dto.reservationId) },
  });

  if (!reservation) {
    throw new NotFoundException('找不到待完成的預約資料');
  }

  if (Number(reservation.participantId) !== Number(participant.groupParticipantId)) {
    throw new BadRequestException('此預約資料與受檢者不符');
  }

  if (reservation.reservationStatus !== 'pending') {
    throw new BadRequestException('此預約已非待確認狀態');
  }

  if (
    reservation.confirmTokenExpiresAt &&
    new Date(reservation.confirmTokenExpiresAt) <= new Date()
  ) {
    const expiredSlot = await this.timeSlotRepo.findOne({
      where: { slotId: Number(reservation.slotId) },
    });

    if (!expiredSlot) {
      throw new NotFoundException('找不到對應時段資料');
    }

    if (expiredSlot.slotReservedCount > 0) {
      expiredSlot.slotReservedCount -= 1;
    }

    if (expiredSlot.slotStatus === 'full') {
      expiredSlot.slotStatus = 'open';
    }

    await this.timeSlotRepo.save(expiredSlot);

    await this.reservationRepo.update(
      { reservationId: Number(reservation.reservationId) },
      {
        quotaStatus: 'cancelled',
        reservationStatus: 'cancelled',
      },
    );

    throw new BadRequestException('此預約保留已逾時，名額已釋放，請重新選擇時段');
  }

  const reservationSlotId = Number(reservation.slotId);
  const dtoSlotId = Number(dto.slotId);

  if (reservationSlotId !== dtoSlotId) {
    throw new BadRequestException('預約時段不一致，請重新選擇時段');
  }

  const slot = await this.timeSlotRepo.findOne({
    where: { slotId: Number(reservation.slotId) },
  });

  if (!slot) {
    throw new NotFoundException('找不到預約時段');
  }

  const branchPackage = await this.branchPackageRepo.findOne({
    where: { branchPackageId: Number(slot.branchPackageId) },
  });

  if (!branchPackage) {
    throw new NotFoundException('找不到院區套餐資料');
  }

  const branchPackageId = Number(branchPackage.packageId);
  const dtoPackageId = Number(dto.packageId);

  if (branchPackageId !== dtoPackageId) {
    throw new BadRequestException('預約套餐不一致，請重新選擇套餐');
  }

const medicalProfile = await this.medicalProfileRepo.save({
  bloodType: dto.medicalProfile?.bloodType || null,
  allergies: dto.medicalProfile?.allergies || null,
  familyHistory: dto.medicalProfile?.familyHistory || null,
  chronicDiseases: dto.medicalProfile?.chronicDiseases || null,
  medications: dto.medicalProfile?.medications || null,
  dietaryPreference: dto.medicalProfile?.dietaryPreference || null,
});

  const confirmToken = randomUUID();
  const cancelToken = randomUUID();

  const tokenExpireMinutes = 15;

  const confirmTokenExpiresAt = new Date(
    Date.now() + tokenExpireMinutes * 60 * 1000,
  );

  const cancelTokenExpiresAt = new Date(`${slot.slotDate}T00:00:00`);
  cancelTokenExpiresAt.setDate(cancelTokenExpiresAt.getDate() - 1);
  cancelTokenExpiresAt.setHours(17, 0, 0, 0);

  await this.reservationRepo.update(
    { reservationId: Number(dto.reservationId) },
    {
      packageId: Number(branchPackage.packageId),
      slotId: Number(dto.slotId),
      medicalProfileId: medicalProfile.medicalProfileId,
      confirmToken,
      confirmTokenExpiresAt,
      cancelToken,
      cancelTokenExpiresAt,
      quotaStatus: 'pending',
      reservationStatus: 'pending',
    },
  );

  const updatedReservation = await this.reservationRepo.findOne({
    where: { reservationId: Number(dto.reservationId) },
  });

  participant.medicalProfileId = medicalProfile.medicalProfileId;
  await this.participantRepo.save(participant);

  const branch = await this.branchRepo.findOne({
    where: { branchId: Number(branchPackage.branchId) },
  });

  const packageInfo = await this.packageRepo.findOne({
    where: { packageId: Number(branchPackage.packageId) },
  });

  if (!branch || !packageInfo || !updatedReservation) {
    throw new NotFoundException('找不到院區、套餐或更新後的預約資料');
  }

  const reservationNo = `R${String(updatedReservation.reservationId).padStart(8, '0')}`;

  await this.mailService.sendReservationActionEmail({
    to: participant.email,
    name: participant.name,
    reservationNo,
    branchName: branch.branchName,
    packageName: packageInfo.packageName,
    date: String(slot.slotDate),
    timeSlot: `${formatTime(String(slot.slotStartTime))}-${formatTime(
      String(slot.slotEndTime),
    )}`,
    confirmToken,
    cancelToken,
    lookupCode: updatedReservation.lookupCode,
  });

  return {
    reservationId: updatedReservation.reservationId,
    reservationNo,
    participantId: participant.groupParticipantId,
    medicalProfileId: medicalProfile.medicalProfileId,
    packageId: Number(branchPackage.packageId),
    slotId: Number(dto.slotId),
    quotaStatus: updatedReservation.quotaStatus,
    reservationStatus: updatedReservation.reservationStatus,
  };
}

@Cron('0 * * * * *')
async releaseExpiredPendingReservations() {
  const now = new Date();

  const expiredReservations = await this.reservationRepo.find({
    where: {
      reservationStatus: 'pending',
    },
  });

  const targetReservations = expiredReservations.filter(
    (reservation) =>
      reservation.confirmTokenExpiresAt &&
      new Date(reservation.confirmTokenExpiresAt) <= now
  );

  for (const reservation of targetReservations) {
    const slot = await this.timeSlotRepo.findOne({
      where: { slotId: Number(reservation.slotId) },
    });

    if (slot) {
      if (slot.slotReservedCount > 0) {
        slot.slotReservedCount -= 1;
      }

      if (slot.slotStatus === 'full') {
        slot.slotStatus = 'open';
      }

      await this.timeSlotRepo.save(slot);
    }

    await this.reservationRepo.update(
      { reservationId: Number(reservation.reservationId) },
      {
        reservationStatus: 'cancelled',
        quotaStatus: 'cancelled',
      },
    );
  }

  if (targetReservations.length > 0) {
  console.log(`[Scheduler] 已釋放過期 pending 預約 ${targetReservations.length} 筆`);
}

  return {
    message: '過期 pending 預約清理完成',
    releasedCount: targetReservations.length,
  };
}

async lookupByIdAndLookupCode(
  idNumber: string,
  lookupCode: string,
): Promise<ReservationLookupResult> {
  const normalizedIdNumber = idNumber.trim().toUpperCase();
  const normalizedLookupCode = lookupCode.trim().toUpperCase();

  const participant = await this.participantRepo.findOne({
    where: { idNumber: normalizedIdNumber },
  });

  if (!participant) {
    throw new NotFoundException('查無符合條件的受檢者資料');
  }

  const reservation = await this.reservationRepo.findOne({
    where: {
      participantId: participant.groupParticipantId,
      lookupCode: normalizedLookupCode,
    },
    order: { reservationId: 'DESC' },
  });

  if (!reservation) {
    throw new NotFoundException('查無預約資料');
  }

  const group = await this.groupRepo.findOne({
    where: { groupId: participant.groupId },
  });

  const slot = await this.timeSlotRepo.findOne({
    where: { slotId: reservation.slotId },
  });

  if (!slot) {
    throw new NotFoundException('找不到對應時段資料');
  }

  const branchPackage = await this.branchPackageRepo.findOne({
    where: { branchPackageId: slot.branchPackageId },
  });

  if (!branchPackage) {
    throw new NotFoundException('找不到對應院區套餐資料');
  }

  const branch = await this.branchRepo.findOne({
    where: { branchId: branchPackage.branchId },
  });

  const packageInfo = await this.packageRepo.findOne({
    where: { packageId: branchPackage.packageId },
  });

  if (!group || !branch || !packageInfo) {
    throw new NotFoundException('預約關聯資料不完整');
  }

  const formatTime = (value: string) => String(value).slice(0, 5);

  let status = '已預約';
  if (reservation.reservationStatus === 'confirmed') {
    status = '已確認';
  } else if (reservation.reservationStatus === 'cancelled') {
    status = '已取消';
  } else if (reservation.reservationStatus === 'pending') {
    status = '待確認';
  }

  return {
    name: participant.name,
    groupName: group.groupName,
    branchName: branch.branchName,
    packageName: packageInfo.packageName,
    date: String(slot.slotDate),
    slot: `${formatTime(String(slot.slotStartTime))}-${formatTime(
      String(slot.slotEndTime),
    )}`,
    status,
  };
}

  private formatTime(value: string | Date): string {
    return String(value).slice(0, 5);
  }

  private toAdminStatus(
    reservationStatus: string,
  ): '已預約' | '已報到' | '已取消' {
    if (reservationStatus === 'cancelled') {
      return '已取消';
    }

    if (reservationStatus === 'checked_in') {
      return '已報到';
    }

    return '已預約';
  }

  private toDbStatus(status: '已預約' | '已報到' | '已取消'): {
    reservationStatus: string;
    quotaStatus: 'pending' | 'confirmed' | 'cancelled';
  } {
    switch (status) {
      case '已預約':
        return {
          reservationStatus: 'confirmed',
          quotaStatus: 'confirmed',
        };
      case '已報到':
        return {
          reservationStatus: 'checked_in',
          quotaStatus: 'confirmed',
        };
      case '已取消':
        return {
          reservationStatus: 'cancelled',
          quotaStatus: 'cancelled',
        };
      default:
        throw new BadRequestException('狀態錯誤');
    }
  }

  private async buildAdminReservation(
    reservation: ReservationEntity,
  ): Promise<AdminReservation> {
    const participant = await this.participantRepo.findOne({
      where: { groupParticipantId: Number(reservation.participantId) },
    });

    const slot = await this.timeSlotRepo.findOne({
      where: { slotId: Number(reservation.slotId) },
    });

    const packageInfo = await this.packageRepo.findOne({
      where: { packageId: Number(reservation.packageId) },
    });

    const branchPackage = slot
    ? await this.branchPackageRepo.findOne({
        where: { branchPackageId: Number(slot.branchPackageId) },
      })
    : null;

    const branch = branchPackage
      ? await this.branchRepo.findOne({
          where: { branchId: Number(branchPackage.branchId) },
        })
      : null;

    if (!participant || !slot || !packageInfo || !branchPackage || !branch) {
      throw new NotFoundException('預約關聯資料不完整');
    }

    return {
      id: Number(reservation.reservationId),
      name: participant.name,
      idNumber: participant.idNumber,
      phone: participant.phone ?? '',
      date: String(slot.slotDate),
      timeSlot: `${this.formatTime(String(slot.slotStartTime))}-${this.formatTime(
        String(slot.slotEndTime),
      )}`,
      packageType: packageInfo.packageName,
      branchName: branch.branchName,
      status: this.toAdminStatus(reservation.reservationStatus),
    };
  }

  private async releaseSlotQuota(slotId: number) {
    const slot = await this.timeSlotRepo.findOne({
      where: { slotId },
    });

    if (!slot) {
      throw new NotFoundException('找不到對應時段資料');
    }

    if (slot.slotReservedCount > 0) {
      slot.slotReservedCount -= 1;
    }

    if (slot.slotStatus === 'full') {
      slot.slotStatus = 'open';
    }

    await this.timeSlotRepo.save(slot);
  }

  private async restoreSlotQuota(slotId: number) {
    const slot = await this.timeSlotRepo.findOne({
      where: { slotId },
    });

    if (!slot) {
      throw new NotFoundException('找不到對應時段資料');
    }

    if (slot.slotReservedCount >= slot.slotCapacity) {
      throw new BadRequestException('此時段已滿額，無法恢復預約');
    }

    slot.slotReservedCount += 1;

    if (slot.slotReservedCount >= slot.slotCapacity) {
      slot.slotStatus = 'full';
    }

    await this.timeSlotRepo.save(slot);
  }

  async findAllAdmin(): Promise<AdminReservation[]> {
    const reservations = await this.reservationRepo.find({
      order: { reservationId: 'DESC' },
    });

    return Promise.all(
      reservations.map((reservation) => this.buildAdminReservation(reservation)),
    );
  }

  async updateStatus(
    id: number,
    status: '已預約' | '已報到' | '已取消',
  ): Promise<AdminReservation> {
    const reservation = await this.reservationRepo.findOne({
      where: { reservationId: id },
    });

    if (!reservation) {
      throw new NotFoundException(`找不到 ID ${id} 的預約紀錄`);
    }

    const oldStatus = reservation.reservationStatus;
    const nextStatus = this.toDbStatus(status);

    if (oldStatus !== 'cancelled' && nextStatus.reservationStatus === 'cancelled') {
      await this.releaseSlotQuota(Number(reservation.slotId));
    }

    if (oldStatus === 'cancelled' && nextStatus.reservationStatus !== 'cancelled') {
      await this.restoreSlotQuota(Number(reservation.slotId));
    }

    reservation.reservationStatus = nextStatus.reservationStatus;
    reservation.quotaStatus = nextStatus.quotaStatus;

    const savedReservation = await this.reservationRepo.save(reservation);

    return this.buildAdminReservation(savedReservation);
  }

  async cancelReservationByAdmin(id: number): Promise<AdminReservation> {
    return this.updateStatus(id, '已取消');
  }

async handleAction(token: string, action: 'confirm' | 'cancel') {
  const reservation = await this.reservationRepo.findOne({
    where:
      action === 'confirm'
        ? { confirmToken: token }
        : { cancelToken: token },
  });

  if (!reservation) {
    throw new NotFoundException('找不到對應的驗證連結');
  }

  const expiresAt =
    action === 'confirm'
      ? reservation.confirmTokenExpiresAt
      : reservation.cancelTokenExpiresAt;

  if (!expiresAt) {
    throw new BadRequestException('此驗證連結未設定有效期限');
  }

  // token 過期：釋放名額 + 將預約改為 cancelled
if (new Date() > new Date(expiresAt)) {
  if (action === 'confirm') {
    if (reservation.reservationStatus !== 'cancelled') {
      const slot = await this.timeSlotRepo.findOne({
        where: { slotId: reservation.slotId },
      });

      if (!slot) {
        throw new NotFoundException('找不到對應時段資料');
      }

      if (slot.slotReservedCount > 0) {
        slot.slotReservedCount -= 1;
      }

      if (slot.slotStatus === 'full') {
        slot.slotStatus = 'open';
      }

      await this.timeSlotRepo.save(slot);

      reservation.quotaStatus = 'cancelled';
      reservation.reservationStatus = 'cancelled';
      await this.reservationRepo.save(reservation);

      throw new BadRequestException('此確認連結已過期，名額已釋放');
    }

    throw new BadRequestException('此確認連結已過期');
  }

  throw new BadRequestException('已超過線上取消期限，請聯絡健檢中心');
}

  if (reservation.reservationStatus === 'cancelled') {
    throw new BadRequestException('此預約已取消');
  }

  if (reservation.reservationStatus === 'confirmed' && action === 'confirm') {
    throw new BadRequestException('此預約已確認');
  }

  // 線上取消期限：健檢日前一天 17:00 前
  if (action === 'cancel') {
    const slot = await this.timeSlotRepo.findOne({
      where: { slotId: reservation.slotId },
    });

    if (!slot) {
      throw new NotFoundException('找不到對應時段資料');
    }

    const slotDate = new Date(`${slot.slotDate}T00:00:00`);
    const cancelDeadline = new Date(slotDate);

    cancelDeadline.setDate(cancelDeadline.getDate() - 1);
    cancelDeadline.setHours(17, 0, 0, 0);

    if (new Date() > cancelDeadline) {
      throw new BadRequestException('已超過線上取消期限，請聯絡健檢中心');
    }
  }

  // 確認預約
  if (action === 'confirm') {
    reservation.quotaStatus = 'confirmed';
    reservation.reservationStatus = 'confirmed';
    await this.reservationRepo.save(reservation);

    return {
      message: '預約已確認成功',
      reservationId: reservation.reservationId,
      reservationStatus: reservation.reservationStatus,
    };
  }

  // 取消預約：要釋放名額
  const slot = await this.timeSlotRepo.findOne({
    where: { slotId: reservation.slotId },
  });

  if (!slot) {
    throw new NotFoundException('找不到對應時段資料');
  }

  if (slot.slotReservedCount > 0) {
    slot.slotReservedCount -= 1;
  }

  if (slot.slotStatus === 'full') {
    slot.slotStatus = 'open';
  }

  await this.timeSlotRepo.save(slot);

  reservation.quotaStatus = 'cancelled';
  reservation.reservationStatus = 'cancelled';
  await this.reservationRepo.save(reservation);

  return {
    message: '預約已取消成功',
    reservationId: reservation.reservationId,
    reservationStatus: reservation.reservationStatus,
  };
}
}