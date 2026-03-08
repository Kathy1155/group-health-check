import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { GroupEntity } from './group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity])],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}