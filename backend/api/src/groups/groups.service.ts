import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { GroupEntity } from './group.entity';
import { GroupBranchEntity } from './group-branch.entity';
import { HospitalBranchEntity } from '../branches/entities/hospital-branch.entity';

type GroupStatus = 'active' | 'inactive';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,

    @InjectRepository(GroupBranchEntity)
    private readonly groupBranchRepo: Repository<GroupBranchEntity>,

    @InjectRepository(HospitalBranchEntity)
    private readonly branchRepo: Repository<HospitalBranchEntity>,
  ) {}

  async findAll() {
    const groups = await this.groupRepo.find({
      relations: {
        groupBranches: {
          branch: true,
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
        groupBranches: {
          branch: true,
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
        groupBranches: {
          branch: true,
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
    availableBranches?: string[];
    status?: GroupStatus;
  }) {
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

    await this.syncGroupBranches(
      savedGroup.groupId,
      data.availableBranches ?? [],
    );

    const fullGroup = await this.groupRepo.findOne({
      where: { groupId: savedGroup.groupId },
      relations: {
        groupBranches: {
          branch: true,
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
      groupCode: string;
      contactName: string;
      contactPhone: string;
      contactEmail: string;
      reservationStartDate: string;
      reservationEndDate: string;
      availableBranches: string[];
      status: GroupStatus;
    }>,
  ) {
    const found = await this.groupRepo.findOne({
      where: { groupId: id },
      relations: {
        groupBranches: {
          branch: true,
        },
      },
    });

    if (!found) {
      throw new NotFoundException('查無此團體資料');
    }

    found.groupName = data.groupName ?? found.groupName;
    found.groupCode = data.groupCode ?? found.groupCode;
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

    if (data.availableBranches !== undefined) {
      await this.syncGroupBranches(id, data.availableBranches);
    }

    const updatedGroup = await this.groupRepo.findOne({
      where: { groupId: id },
      relations: {
        groupBranches: {
          branch: true,
        },
      },
    });

    if (!updatedGroup) {
      throw new NotFoundException('更新後找不到團體資料');
    }

    return this.toResponse(updatedGroup);
  }

  private async syncGroupBranches(groupId: number, branchNames: string[]) {
    const existingRelations = await this.groupBranchRepo.find({
      where: { groupId },
    });

    if (existingRelations.length > 0) {
      await this.groupBranchRepo.remove(existingRelations);
    }

    if (!branchNames || branchNames.length === 0) {
      return;
    }

    const branches = await this.branchRepo.find({
      where: {
        branchName: In(branchNames),
      },
    });

    const newRelations = branches.map((branch) =>
      this.groupBranchRepo.create({
        groupId,
        branchId: branch.branchId,
      }),
    );

    await this.groupBranchRepo.save(newRelations);
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
      availableBranches:
        group.groupBranches?.map((gb) => gb.branch?.branchName).filter(Boolean) ?? [],
      status: group.groupIsDisable === 1 ? 'inactive' : 'active',
    };
  }
}