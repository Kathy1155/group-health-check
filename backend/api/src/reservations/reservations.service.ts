import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateReservationDto } from './dto/update-reservation.dto';
import { ReservationEntity } from './entities/reservation.entity';
import { MedicalProfileEntity } from './entities/medical-profile.entity';

import { GroupEntity } from '../groups/group.entity';
import { GroupParticipantEntity } from '../roster/group-participant.entity';
import { TimeSlotEntity } from '../timeslots/time-slot.entity';

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
  ) {}

  // 先保留：前台查詢預約目前仍用 mock
  private mockReservations: {
    idNumber: string;
    birthday: string;
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

  // 先保留：健檢中心後台清單目前仍用 mock
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

    if (slot.slotStatus === 'full' || slot.slotReservedCount >= slot.slotCapacity) {
      throw new BadRequestException('此時段已滿額');
    }

    const medicalProfile = await this.medicalProfileRepo.save({
      bloodType: dto.medicalProfile?.bloodType || null,
      allergies: dto.medicalProfile?.allergies || null,
      familyHistory: dto.medicalProfile?.familyHistory || null,
      chronicDiseases: dto.medicalProfile?.chronicDiseases || null,
      medications: dto.medicalProfile?.medications || null,
    });

    const reservation = await this.reservationRepo.save({
      participantId: participant.groupParticipantId,
      packageId: dto.packageId,
      slotId: dto.slotId,
      medicalProfileId: medicalProfile.medicalProfileId,
      quotaStatus: 'confirmed',
    });

    participant.medicalProfileId = medicalProfile.medicalProfileId;
    await this.participantRepo.save(participant);

    slot.slotReservedCount += 1;

    if (slot.slotReservedCount >= slot.slotCapacity) {
      slot.slotStatus = 'full';
    }

    await this.timeSlotRepo.save(slot);

    return {
      reservationId: reservation.reservationId,
      reservationNo: `R${String(reservation.reservationId).padStart(8, '0')}`,
      participantId: participant.groupParticipantId,
      medicalProfileId: medicalProfile.medicalProfileId,
      packageId: dto.packageId,
      slotId: dto.slotId,
      quotaStatus: 'confirmed',
    };
  }

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
}