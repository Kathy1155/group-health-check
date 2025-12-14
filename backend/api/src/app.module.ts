import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { PackagesModule } from './packages/packages.module';
import { ReservationsModule } from './reservations/reservations.module';
import { TimeslotsModule } from './timeslots/timeslots.module';
import { RosterModule } from './roster/roster.module';   // 新增這行

@Module({
  imports: [
    AuthModule,
    GroupsModule,
    PackagesModule,
    ReservationsModule,
    TimeslotsModule,
    RosterModule,   // 再把它放進 imports 陣列
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
