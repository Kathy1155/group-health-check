import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { ReservationsModule } from './reservations/reservations.module';
import { TimeslotsModule } from './timeslots/timeslots.module';
import { PackagesModule } from './packages/packages.module';

@Module({
  imports: [AuthModule, GroupsModule, ReservationsModule, TimeslotsModule, PackagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
