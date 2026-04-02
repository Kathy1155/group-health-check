import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { BranchPackageEntity } from '../../branch-packages/entities/branch-package.entity';
import { GroupBranchEntity } from '../../groups/group-branch.entity';

@Entity({ name: 'branch' })
export class HospitalBranchEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
    name: 'branch_id',
  })
  branchId: number;

  @Column({ type: 'varchar', length: 100, name: 'branch_name' })
  branchName: string;

  @Column({
    type: 'varchar',
    length: 200,
    name: 'branch_address',
    nullable: true,
  })
  branchAddress?: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'branch_phone',
    nullable: true,
  })
  branchPhone?: string;

  @OneToMany(() => BranchPackageEntity, (bp) => bp.branch)
  branchPackages: BranchPackageEntity[];

  @OneToMany(() => GroupBranchEntity, (gb) => gb.branch)
  groupBranches: GroupBranchEntity[];
}