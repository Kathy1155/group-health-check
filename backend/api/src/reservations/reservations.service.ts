import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { CreateReservationDto } from './dto/update-reservation.dto';
import { ReservationEntity } from './entities/reservation.entity';
import { MedicalProfileEntity } from './entities/medical-profile.entity';

import { GroupEntity } from '../groups/group.entity';
import { GroupParticipantEntity } from '../roster/group-participant.entity';
import { TimeSlotEntity } from '../timeslots/time-slot.entity';
import { MailService } from '../mail/mail.service';

import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';
import { HospitalBranchEntity } from '../branches/entities/hospital-branch.entity';
import { HealthExaminationPackageEntity } from '../packages/entities/health-examination-package.entity';

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


  // 健檢中心後台清單暫時 mock
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

async createReservationWithProfile(dto: CreateReservationDto) {
  const formatTime = (value: string) => value.slice(0, 5);

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

  const medicalProfile = await this.medicalProfileRepo.save({
    bloodType: dto.medicalProfile?.bloodType || null,
    allergies: dto.medicalProfile?.allergies || null,
    familyHistory: dto.medicalProfile?.familyHistory || null,
    chronicDiseases: dto.medicalProfile?.chronicDiseases || null,
    medications: dto.medicalProfile?.medications || null,
  });

  const confirmToken = randomUUID();
  const cancelToken = randomUUID();

  const tokenExpireMinutes = 15;

const confirmTokenExpiresAt = new Date(
  Date.now() + tokenExpireMinutes * 60 * 1000,
);

const cancelTokenExpiresAt = new Date(
  Date.now() + tokenExpireMinutes * 60 * 1000,
);

  const branchPackage = await this.branchPackageRepo.findOne({
  where: { branchPackageId: slot.branchPackageId },
});

if (!branchPackage) {
  throw new NotFoundException('找不到院區套餐資料');
}

  const reservation = this.reservationRepo.create({
    participantId: participant.groupParticipantId,
    packageId: branchPackage.packageId,
    slotId: dto.slotId,
    medicalProfileId: medicalProfile.medicalProfileId,
    quotaStatus: 'pending',
    confirmToken,
    confirmTokenExpiresAt,
    cancelToken,
    cancelTokenExpiresAt,
    reservationStatus: 'pending',
  });

  await this.reservationRepo.save(reservation);

  participant.medicalProfileId = medicalProfile.medicalProfileId;
  await this.participantRepo.save(participant);

  slot.slotReservedCount += 1;

  if (slot.slotReservedCount >= slot.slotCapacity) {
    slot.slotStatus = 'full';
  }

  await this.timeSlotRepo.save(slot);

const branch = await this.branchRepo.findOne({
  where: { branchId: branchPackage.branchId },
});

const packageInfo = await this.packageRepo.findOne({
  where: { packageId: branchPackage.packageId },
});

if (!branch || !packageInfo) {
  throw new NotFoundException('找不到院區或套餐名稱');
}

  const reservationNo = `R${String(reservation.reservationId).padStart(8, '0')}`;

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
  });

    return {
      reservationId: reservation.reservationId,
      reservationNo,
      participantId: participant.groupParticipantId,
      medicalProfileId: medicalProfile.medicalProfileId,
      packageId: branchPackage.packageId,
      slotId: dto.slotId,
      quotaStatus: reservation.quotaStatus,
      reservationStatus: reservation.reservationStatus,
    };
}

  async lookupByIdAndBirthday(
    idNumber: string,
    birthday: string,
  ): Promise<ReservationLookupResult> {
    const participant = await this.participantRepo.findOne({
      where: { idNumber, birthDate: birthday as any },
    });

    if (!participant) {
      throw new NotFoundException('查無符合條件的受檢者資料');
    }

    const reservation = await this.reservationRepo.findOne({
      where: { participantId: participant.groupParticipantId },
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

  findAllAdmin(): AdminReservation[] {
    return this.adminReservations;
  }

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

      throw new BadRequestException('此驗證連結已過期，名額已釋放');
    }

    throw new BadRequestException('此驗證連結已過期');
  }

  if (reservation.reservationStatus === 'cancelled') {
    throw new BadRequestException('此預約已取消');
  }

  if (reservation.reservationStatus === 'confirmed' && action === 'confirm') {
    throw new BadRequestException('此預約已確認');
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