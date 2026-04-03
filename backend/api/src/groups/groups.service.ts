import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { GroupEntity } from './group.entity';
import { GroupPackageEntity } from './group-package.entity';
import { HealthExaminationPackageEntity } from '../packages/entities/health-examination-package.entity';
import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';
import { HospitalBranchEntity } from '../branches/entities/hospital-branch.entity';

type GroupStatus = 'active' | 'inactive';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,

    @InjectRepository(GroupPackageEntity)
    private readonly groupPackageRepo: Repository<GroupPackageEntity>,

    @InjectRepository(HealthExaminationPackageEntity)
    private readonly packageRepo: Repository<HealthExaminationPackageEntity>,

    @InjectRepository(BranchPackageEntity)
    private readonly branchPackageRepo: Repository<BranchPackageEntity>,

    @InjectRepository(HospitalBranchEntity)
    private readonly branchRepo: Repository<HospitalBranchEntity>,
  ) {}

  async findAll() {
    const groups = await this.groupRepo.find({
      relations: {
        groupPackages: {
          package: true,
        },
      },
      order: {
        groupId: 'DESC',
      },
    });

    return groups.map((group) => this.toResponse(group));
  }

  async findOne(id: number) {
    const found = await this.groupRepo.findOne({
      where: { groupId: id },
      relations: {
        groupPackages: {
          package: true,
        },
      },
    });

    if (!found) {
      throw new NotFoundException('查無此團體資料');
    }

    return this.toResponse(found);
  }

  async findByCode(code: string) {
    const found = await this.groupRepo.findOne({
      where: { groupCode: code },
      relations: {
        groupPackages: {
          package: true,
        },
      },
    });

    if (!found) {
      throw new NotFoundException('查無此團體代碼');
    }

    return this.toResponse(found);
  }

  async create(data: {
    groupName: string;
    groupCode: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    reservationStartDate?: string;
    reservationEndDate?: string;
    availablePackageIds?: number[];
    status?: GroupStatus;
  }) {
    this.validateReservationDates(
      data.reservationStartDate,
      data.reservationEndDate,
    );

    if (!data.availablePackageIds || data.availablePackageIds.length === 0) {
      throw new BadRequestException('請至少選擇一個可預約套餐');
    }

    const duplicated = await this.groupRepo.findOne({
      where: { groupCode: data.groupCode },
    });

    if (duplicated) {
      throw new ConflictException('團體代碼已存在');
    }

    await this.validatePackageIds(data.availablePackageIds);

    const group = this.groupRepo.create({
      groupName: data.groupName,
      groupCode: data.groupCode,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      reservationOpenStart: data.reservationStartDate || null,
      reservationOpenEnd: data.reservationEndDate || null,
      groupIsDisable: data.status === 'inactive' ? 1 : 0,
      createByUserId: null,
      updateByUserId: null,
    });

    const savedGroup = await this.groupRepo.save(group);

    await this.syncGroupPackages(
      savedGroup.groupId,
      data.availablePackageIds,
    );

    const fullGroup = await this.groupRepo.findOne({
      where: { groupId: savedGroup.groupId },
      relations: {
        groupPackages: {
          package: true,
        },
      },
    });

    if (!fullGroup) {
      throw new NotFoundException('新增後找不到團體資料');
    }

    return this.toResponse(fullGroup);
  }

  async update(
    id: number,
    data: Partial<{
      groupName: string;
      contactName: string;
      contactPhone: string;
      contactEmail: string;
      reservationStartDate: string;
      reservationEndDate: string;
      availablePackageIds: number[];
      status: GroupStatus;
    }>,
  ) {
    const found = await this.groupRepo.findOne({
      where: { groupId: id },
      relations: {
        groupPackages: {
          package: true,
        },
      },
    });

    if (!found) {
      throw new NotFoundException('查無此團體資料');
    }

    this.validateReservationDates(
      data.reservationStartDate ?? found.reservationOpenStart ?? undefined,
      data.reservationEndDate ?? found.reservationOpenEnd ?? undefined,
    );

    if (data.availablePackageIds !== undefined) {
      if (data.availablePackageIds.length === 0) {
        throw new BadRequestException('請至少選擇一個可預約套餐');
      }

      await this.validatePackageIds(data.availablePackageIds);
    }

    found.groupName = data.groupName ?? found.groupName;
    found.contactName = data.contactName ?? found.contactName;
    found.contactPhone = data.contactPhone ?? found.contactPhone;
    found.contactEmail = data.contactEmail ?? found.contactEmail;

    if (data.reservationStartDate !== undefined) {
      found.reservationOpenStart = data.reservationStartDate || null;
    }

    if (data.reservationEndDate !== undefined) {
      found.reservationOpenEnd = data.reservationEndDate || null;
    }

    if (data.status !== undefined) {
      found.groupIsDisable = data.status === 'inactive' ? 1 : 0;
    }

    found.updateByUserId = null;

    await this.groupRepo.save(found);

    if (data.availablePackageIds !== undefined) {
      await this.syncGroupPackages(id, data.availablePackageIds);
    }

    const updatedGroup = await this.groupRepo.findOne({
      where: { groupId: id },
      relations: {
        groupPackages: {
          package: true,
        },
      },
    });

    if (!updatedGroup) {
      throw new NotFoundException('更新後找不到團體資料');
    }

    return this.toResponse(updatedGroup);
  }

  async findGroupOptions(groupId: number) {
    const group = await this.groupRepo.findOne({
      where: { groupId },
      relations: {
        groupPackages: {
          package: true,
        },
      },
    });

    if (!group) {
      throw new NotFoundException('查無此團體資料');
    }

    if (group.groupIsDisable === 1) {
      throw new BadRequestException('此團體目前停用');
    }

    const packageIds =
      group.groupPackages
        ?.map((gp) => gp.packageId)
        .filter((idValue): idValue is number => Boolean(idValue)) ?? [];

    if (packageIds.length === 0) {
      return {
        groupId: group.groupId,
        branches: [],
      };
    }

    const branchPackages = await this.branchPackageRepo.find({
      where: {
        packageId: In(packageIds),
        branchPackageStatus: 'open' as any,
      },
      relations: {
        branch: true,
        package: true,
      },
    });

    const branchMap = new Map<
      number,
      {
        branchId: number;
        branchName: string;
        packages: { packageId: number; packageName: string }[];
      }
    >();

    for (const item of branchPackages) {
      if (!item.branch || !item.package) continue;
      if (item.package.packageIsDisable) continue;

      const existing = branchMap.get(item.branch.branchId);

      if (!existing) {
        branchMap.set(item.branch.branchId, {
          branchId: item.branch.branchId,
          branchName: item.branch.branchName,
          packages: [
            {
              packageId: item.package.packageId,
              packageName: item.package.packageName,
            },
          ],
        });
      } else {
        const alreadyExists = existing.packages.some(
          (pkg) => pkg.packageId === item.package.packageId,
        );

        if (!alreadyExists) {
          existing.packages.push({
            packageId: item.package.packageId,
            packageName: item.package.packageName,
          });
        }
      }
    }

    return {
      groupId: group.groupId,
      branches: Array.from(branchMap.values()).sort((a, b) =>
        a.branchId - b.branchId,
      ),
    };
  }

  private async syncGroupPackages(groupId: number, packageIds: number[]) {
    const existingRelations = await this.groupPackageRepo.find({
      where: { groupId },
    });

    if (existingRelations.length > 0) {
      await this.groupPackageRepo.remove(existingRelations);
    }

    if (!packageIds || packageIds.length === 0) {
      return;
    }

    const newRelations = packageIds.map((packageId) =>
      this.groupPackageRepo.create({
        groupId,
        packageId,
      }),
    );

    await this.groupPackageRepo.save(newRelations);
  }

  private async validatePackageIds(packageIds: number[]) {
    const uniqueIds = [...new Set(packageIds)];

    const packages = await this.packageRepo.find({
      where: {
        packageId: In(uniqueIds),
      },
    });

    if (packages.length !== uniqueIds.length) {
      throw new BadRequestException('部分套餐不存在');
    }

    const disabledPackage = packages.find((pkg) => pkg.packageIsDisable);
    if (disabledPackage) {
      throw new BadRequestException('不可選擇已停用的套餐');
    }
  }

  private validateReservationDates(
    startDate?: string,
    endDate?: string,
  ) {
    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException('開放預約截止日不可早於開始日');
    }
  }

  private toResponse(group: GroupEntity) {
    return {
      id: group.groupId,
      groupName: group.groupName,
      groupCode: group.groupCode,
      contactName: group.contactName,
      contactPhone: group.contactPhone,
      contactEmail: group.contactEmail,
      reservationStartDate: group.reservationOpenStart ?? '',
      reservationEndDate: group.reservationOpenEnd ?? '',
      availablePackageIds:
        group.groupPackages?.map((gp) => gp.package?.packageId).filter(Boolean) ?? [],
      availablePackages:
        group.groupPackages?.map((gp) => ({
          packageId: gp.package?.packageId,
          packageName: gp.package?.packageName,
        })) ?? [],
      status: group.groupIsDisable === 1 ? 'inactive' : 'active',
    };
  }
}