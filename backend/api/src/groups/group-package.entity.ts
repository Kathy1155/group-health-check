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
import { HealthExaminationPackageEntity } from '../packages/entities/health-examination-package.entity';

@Entity({ name: 'group_package' })
export class GroupPackageEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
    name: 'group_package_id',
  })
  groupPackageId: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'group_id',
  })
  groupId: number;

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'package_id',
  })
  packageId: number;

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

  @ManyToOne(() => GroupEntity, (group) => group.groupPackages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;

  @ManyToOne(
    () => HealthExaminationPackageEntity,
    (pkg) => pkg.groupPackages,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'package_id' })
  package: HealthExaminationPackageEntity;
}