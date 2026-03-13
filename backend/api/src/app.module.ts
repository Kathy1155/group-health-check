import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    // 讀取 backend/api/.env
    ConfigModule.forRoot({ isGlobal: true }),

    // MySQL 連線（使用 .env）
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
    }),

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