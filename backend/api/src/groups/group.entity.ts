import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GroupBranchEntity } from './group-branch.entity';

@Entity({ name: 'group' })
export class GroupEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
    name: 'group_id',
  })
  groupId: number;

  @Column({
    type: 'char',
    length: 10,
    name: 'group_code',
  })
  groupCode: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'group_name',
  })
  groupName: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'contact_name',
  })
  contactName: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'contact_phone',
  })
  contactPhone: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'contact_email',
  })
  contactEmail: string;

  @Column({
    type: 'tinyint',
    width: 1,
    name: 'group_isDisable',
    default: () => '0',
  })
  groupIsDisable: number;

  @Column({
    type: 'date',
    name: 'reservation_open_start',
    nullable: true,
  })
  reservationOpenStart?: string | null;

  @Column({
    type: 'date',
    name: 'reservation_open_end',
    nullable: true,
  })
  reservationOpenEnd?: string | null;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'create_by_user_id',
    nullable: true,
  })
  createByUserId: number | null;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'update_by_user_id',
    nullable: true,
  })
  updateByUserId: number | null;

  @OneToMany(() => GroupBranchEntity, (groupBranch) => groupBranch.group)
  groupBranches: GroupBranchEntity[];
}