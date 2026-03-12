import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RosterService } from './roster.service';
import { RosterController } from './roster.controller';
import { GroupEntity } from '../groups/group.entity';
import { GroupParticipantEntity } from './group-participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity, GroupParticipantEntity])],
  providers: [RosterService],
  controllers: [RosterController],
})
export class RosterModule {}