import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HealthExaminationPackageEntity } from '../../packages/entities/health-examination-package.entity';
import { HospitalBranchEntity } from '../../branches/entities/hospital-branch.entity';

@Entity({ name: 'branch_package' })
export class BranchPackageEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'branch_package_id' })
  branchPackageId: number;

  @Column({ type: 'bigint', name: 'package_id' })
  packageId: number;

  @Column({ type: 'bigint', name: 'branch_id' })
  branchId: number;

  @Column({
    type: 'enum',
    enum: ['open', 'closed'],
    name: 'branch_package_status',
  })
  branchPackageStatus: 'open' | 'closed';

  // ✅ 這張表才有時間欄位
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'bigint', name: 'create_by_user_id', nullable: true })
  createByUserId?: number;

  @Column({ type: 'bigint', name: 'update_by_user_id', nullable: true })
  updateByUserId?: number;

  @ManyToOne(() => HealthExaminationPackageEntity, (pkg) => pkg.branchPackages)
  @JoinColumn({ name: 'package_id' })
  package: HealthExaminationPackageEntity;

  @ManyToOne(() => HospitalBranchEntity, (branch) => branch.branchPackages)
  @JoinColumn({ name: 'branch_id' })
  branch: HospitalBranchEntity;
}