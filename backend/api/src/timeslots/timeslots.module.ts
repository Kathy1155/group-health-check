import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeslotsService } from './timeslots.service';
import { TimeslotsController } from './timeslots.controller';
import { TimeSlotEntity } from './time-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSlotEntity])],
  controllers: [TimeslotsController],
  providers: [TimeslotsService],
})
export class TimeslotsModule {}