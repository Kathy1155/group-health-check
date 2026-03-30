import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeslotsController } from './timeslots.controller';
import { TimeslotsService } from './timeslots.service';
import { TimeSlotEntity } from './time-slot.entity';
import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSlotEntity, BranchPackageEntity])],
  controllers: [TimeslotsController],
  providers: [TimeslotsService],
})
export class TimeslotsModule {}