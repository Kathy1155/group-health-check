import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReservationEntity } from '../reservations/entities/reservation.entity';
import { GroupParticipantEntity } from '../roster/group-participant.entity';
import { TimeSlotEntity } from '../timeslots/time-slot.entity';
import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';
import { HospitalBranchEntity } from '../branches/entities/hospital-branch.entity';
import { HealthExaminationPackageEntity } from '../packages/entities/health-examination-package.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly reservationRepo: Repository<ReservationEntity>,

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

  async sendReservationConfirmation(payload: {
    reservationId: number;
  }) {
    const reservation = await this.reservationRepo.findOne({
      where: { reservationId: payload.reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('找不到預約資料');
    }

    const participant = await this.participantRepo.findOne({
      where: {
        groupParticipantId: reservation.participantId,
      },
    });

    if (!participant) {
      throw new NotFoundException('找不到受檢者資料');
    }

    const slot = await this.timeSlotRepo.findOne({
      where: {
        slotId: reservation.slotId,
      },
    });

    if (!slot) {
      throw new NotFoundException('找不到時段資料');
    }

    const branchPackage = await this.branchPackageRepo.findOne({
      where: {
        branchPackageId: slot.branchPackageId,
      },
    });

    if (!branchPackage) {
      throw new NotFoundException('找不到院區套餐資料');
    }

    const branch = await this.branchRepo.findOne({
      where: {
        branchId: branchPackage.branchId,
      },
    });

    const packageInfo = await this.packageRepo.findOne({
      where: {
        packageId: branchPackage.packageId,
      },
    });

    if (!branch || !packageInfo) {
      throw new NotFoundException('找不到院區或套餐資料');
    }

    const formatTime = (value: string) => value.slice(0, 5);

    const reservationNo = `R${String(
      reservation.reservationId,
    ).padStart(8, '0')}`;

    if (!reservation.confirmToken || !reservation.cancelToken) {
       throw new NotFoundException('找不到預約確認或取消 token');
    }

    await this.mailService.sendReservationActionEmail({
      to: participant.email,
      name: participant.name,
      reservationNo,
      branchName: branch.branchName,
      packageName: packageInfo.packageName,
      date: String(slot.slotDate),
      timeSlot: `${formatTime(
        String(slot.slotStartTime),
      )}-${formatTime(String(slot.slotEndTime))}`,
      confirmToken: reservation.confirmToken,
      cancelToken: reservation.cancelToken,
    });

    return { ok: true };
  }
}