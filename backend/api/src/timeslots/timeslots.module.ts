import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeslotsController } from './timeslots.controller';
import { TimeslotsService } from './timeslots.service';
import { TimeSlotEntity } from './time-slot.entity';
import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';
import { GroupEntity } from '../groups/group.entity';
import { GroupParticipantEntity } from '../roster/group-participant.entity';
import { ReservationEntity } from '../reservations/entities/reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TimeSlotEntity,
      BranchPackageEntity,
      GroupEntity,
      GroupParticipantEntity,
      ReservationEntity,
    ]),
  ],
  controllers: [TimeslotsController],
  providers: [TimeslotsService],
})
export class TimeslotsModule {}
