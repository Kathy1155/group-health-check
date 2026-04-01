import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

import { ReservationEntity } from './entities/reservation.entity';
import { MedicalProfileEntity } from './entities/medical-profile.entity';
import { GroupEntity } from '../groups/group.entity';
import { GroupParticipantEntity } from '../roster/group-participant.entity';
import { TimeSlotEntity } from '../timeslots/time-slot.entity';
import { MailModule } from '../mail/mail.module';
import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';

// 新增這兩個
import { HospitalBranchEntity } from '../branches/entities/hospital-branch.entity';
import { HealthExaminationPackageEntity } from '../packages/entities/health-examination-package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReservationEntity,
      MedicalProfileEntity,
      GroupEntity,
      GroupParticipantEntity,
      TimeSlotEntity,
      BranchPackageEntity,
      HospitalBranchEntity,
      HealthExaminationPackageEntity,
    ]),
    MailModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}