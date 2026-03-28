import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { BranchPackageEntity } from '../../branch-packages/entities/branch-package.entity';

@Entity({ name: 'health_exam_package' })
export class HealthExaminationPackageEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'package_id' })
  packageId: number;

  @Column({ type: 'varchar', length: 20, name: 'package_code' })
  packageCode: string;

  @Column({ type: 'varchar', length: 100, name: 'package_name' })
  packageName: string;

  @Column({ type: 'tinyint', width: 1, name: 'package_isDisable' })
  packageIsDisable: boolean;

  @Column({ type: 'bigint', name: 'create_by_user_id', nullable: true })
  createByUserId?: number;

  @Column({ type: 'bigint', name: 'update_by_user_id', nullable: true })
  updateByUserId?: number;

  @OneToMany(() => BranchPackageEntity, (bp) => bp.package)
  branchPackages: BranchPackageEntity[];
}