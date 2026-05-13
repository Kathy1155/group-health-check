import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StaffUserEntity } from './staff-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StaffUserEntity])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}