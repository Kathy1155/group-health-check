import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationsController } from './verifications.controller';
import { VerificationsService } from './verifications.service';
import { GroupEntity } from '../groups/group.entity';
import { GroupParticipantEntity } from '../roster/group-participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity, GroupParticipantEntity])],
  controllers: [VerificationsController],
  providers: [VerificationsService],
})
export class VerificationsModule {}