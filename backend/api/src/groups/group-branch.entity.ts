import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroupEntity } from './group.entity';
import { HospitalBranchEntity } from '../branches/entities/hospital-branch.entity';

@Entity({ name: 'group_branch' })
export class GroupBranchEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
    name: 'group_branch_id',
  })
  groupBranchId: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'group_id',
  })
  groupId: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'branch_id',
  })
  branchId: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    nullable: true,
  })
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    nullable: true,
  })
  updatedAt?: Date;

  @ManyToOne(() => GroupEntity, (group) => group.groupBranches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;

  @ManyToOne(
    () => HospitalBranchEntity,
    (branch) => branch.groupBranches,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'branch_id' })
  branch: HospitalBranchEntity;
}