import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupEntity } from './group.entity';
import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';
import { HospitalBranchEntity } from '../branches/entities/hospital-branch.entity';
import { HealthExaminationPackageEntity } from '../packages/entities/health-examination-package.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,

    @InjectRepository(BranchPackageEntity)
    private readonly branchPackageRepo: Repository<BranchPackageEntity>,

    @InjectRepository(HospitalBranchEntity)
    private readonly branchRepo: Repository<HospitalBranchEntity>,

    @InjectRepository(HealthExaminationPackageEntity)
    private readonly packageRepo: Repository<HealthExaminationPackageEntity>,
  ) {}

  // 1. 取得所有團體 (從資料庫)
  async findAll() {
    return this.groupRepo.find({ order: { groupId: 'DESC' as any } });
  }

  // 2. 取得單一團體 (從資料庫)
  async findOne(id: number) {
    const found = await this.groupRepo.findOne({ where: { groupId: id } });
    if (!found) throw new NotFoundException('查無此團體');
    return found;
  }

  // 3. 透過代碼搜尋團體 (從資料庫)
  async findByCode(code: string) {
    const found = await this.groupRepo.findOne({ where: { groupCode: code } });
    if (!found) throw new NotFoundException('查無此團體代碼');
    return found;
  }

  // 4. 新增團體 (到資料庫)
  async create(body: {
    groupName: string;
    groupCode: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    status?: 'active' | 'inactive';
  }) {
    const entity = this.groupRepo.create({
      groupName: body.groupName,
      groupCode: body.groupCode,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      groupIsDisable: body.status === 'inactive' ? 1 : 0,
      createByUserId: null,
      updateByUserId: null,
    });

    try {
      return await this.groupRepo.save(entity);
    } catch (err: any) {
      console.error('新增 group 失敗：', err);
      if (err?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('團體代碼已存在');
      }
      throw new InternalServerErrorException('新增團體失敗');
    }
  }

  // 5. 透過 groupId 取得可預約的院區與套餐選項 (從資料庫)
    async findGroupOptions(groupId: number) {
      const group = await this.groupRepo.findOne({
        where: { groupId },
      });

      if (!group) {
        throw new NotFoundException('查無此團體');
      }

      const branchPackages = await this.branchPackageRepo.find({
        relations: ['branch', 'package'],
        order: {
          branchId: 'ASC' as any,
          packageId: 'ASC' as any,
        },
      });

      const availableItems = branchPackages.filter(
        (item) =>
          item.branchPackageStatus === 'open' &&
          item.branch &&
          item.package &&
          !item.package.packageIsDisable,
      );

      const branchMap = new Map<
        number,
        {
          branchId: number;
          branchName: string;
          packages: {
            packageId: number;
            packageName: string;
          }[];
        }
      >();

      for (const item of availableItems) {
        const branchId = Number(item.branch.branchId);
        const packageId = Number(item.package.packageId);

        if (!branchMap.has(branchId)) {
          branchMap.set(branchId, {
            branchId,
            branchName: item.branch.branchName,
            packages: [],
          });
        }

        branchMap.get(branchId)!.packages.push({
          packageId,
          packageName: item.package.packageName,
        });
      }

      return {
        groupId: Number(groupId),
        branches: Array.from(branchMap.values()),
      };
    }
}