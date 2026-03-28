import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { HealthExaminationPackageEntity } from './entities/health-examination-package.entity';
import { HospitalBranchEntity } from '../branches/entities/hospital-branch.entity';
import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';
import { UpdatePackageBranchesDto } from './dto/update-package-branches.dto';

function mapDbStatusToApiStatus(
  status: 'open' | 'closed',
): 'active' | 'inactive' {
  return status === 'open' ? 'active' : 'inactive';
}

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(HealthExaminationPackageEntity)
    private readonly packageRepo: Repository<HealthExaminationPackageEntity>,

    @InjectRepository(HospitalBranchEntity)
    private readonly branchRepo: Repository<HospitalBranchEntity>,

    @InjectRepository(BranchPackageEntity)
    private readonly branchPackageRepo: Repository<BranchPackageEntity>,
  ) {}

  async findAllPackages() {
    const packages = await this.packageRepo.find({
      order: { packageId: 'ASC' },
    });

    return packages.map((pkg) => ({
      packageId: Number(pkg.packageId),
      packageCode: pkg.packageCode,
      packageName: pkg.packageName,
      isDisable: Boolean(pkg.packageIsDisable),
    }));
  }

  async findAllBranches() {
    const branches = await this.branchRepo.find({
      order: { branchId: 'ASC' },
    });

    return branches.map((branch) => ({
      branchId: Number(branch.branchId),
      branchName: branch.branchName,
    }));
  }

  async findPackageBranches(packageId: number) {
    const pkg = await this.packageRepo.findOne({
      where: { packageId },
    });

    if (!pkg) {
      throw new NotFoundException('找不到此套餐');
    }

    const branchPackages = await this.branchPackageRepo.find({
      where: { packageId },
      order: { branchId: 'ASC' },
    });

    const openItems = branchPackages.filter(
      (item) => item.branchPackageStatus === 'open',
    );

    return {
      packageId: Number(pkg.packageId),
      packageCode: pkg.packageCode,
      packageName: pkg.packageName,
      status: pkg.packageIsDisable ? 'inactive' : 'active',
      selectedBranchIds: openItems.map((item) => Number(item.branchId)),
      allSavedBranchSettings: branchPackages.map((item) => ({
        branchId: Number(item.branchId),
        branchPackageStatus: mapDbStatusToApiStatus(item.branchPackageStatus),
      })),
    };
  }

  async savePackageBranches(
    packageId: number,
    dto: UpdatePackageBranchesDto,
  ) {
    const pkg = await this.packageRepo.findOne({
      where: { packageId },
    });

    if (!pkg) {
      throw new NotFoundException('找不到此套餐');
    }

    const selectedBranchIds = (dto.selectedBranchIds ?? []).map(Number);
    const status = dto.status;

    if (selectedBranchIds.length > 0) {
      const existingBranches = await this.branchRepo.find({
        where: { branchId: In(selectedBranchIds) },
      });

      if (existingBranches.length !== selectedBranchIds.length) {
        throw new NotFoundException('部分院區不存在');
      }
    }

    const existingMappings = await this.branchPackageRepo.find({
      where: { packageId },
    });

    const existingMap = new Map<number, BranchPackageEntity>(
      existingMappings.map((item) => [Number(item.branchId), item]),
    );

    const selectedSet = new Set<number>(selectedBranchIds);

    // 勾選的院區 = open
    // 沒勾選的院區 = closed
    // 套餐停用與否只看 package_isDisable，不要影響院區搭配記錄
    for (const item of existingMappings) {
      item.branchPackageStatus = selectedSet.has(Number(item.branchId))
        ? 'open'
        : 'closed';
    }

    if (existingMappings.length > 0) {
      await this.branchPackageRepo.save(existingMappings);
    }

    const newBranchIds = selectedBranchIds.filter(
      (branchId) => !existingMap.has(branchId),
    );

    if (newBranchIds.length > 0) {
      const newItems = newBranchIds.map((branchId) =>
        this.branchPackageRepo.create({
          packageId,
          branchId,
          branchPackageStatus: 'open',
        }),
      );

      await this.branchPackageRepo.save(newItems);
    }

    // 套餐本身的啟用 / 停用
    pkg.packageIsDisable = status === 'inactive';
    await this.packageRepo.save(pkg);

    return this.findPackageBranches(packageId);
  }
}