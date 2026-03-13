import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupEntity } from './group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,
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

  // 5. ⭐ 這是你原本在本地新增的「可預約院區 + 套餐」API (目前先用假資料)
  findGroupOptions(groupId: number) {
    const packages = {
      A: { packageId: 101, packageName: '健檢套餐 A' },
      B: { packageId: 102, packageName: '健檢套餐 B' },
      C: { packageId: 103, packageName: '健檢套餐 C' },
      D: { packageId: 104, packageName: '健檢套餐 D' },
      E: { packageId: 105, packageName: '健檢套餐 E' },
    };

    return {
      groupId,
      branches: [
        { branchId: 1, branchName: '忠孝院區', packages: [packages.A, packages.B, packages.E] },
        { branchId: 2, branchName: '仁愛院區', packages: [packages.A, packages.B, packages.C, packages.D] },
        { branchId: 3, branchName: '和平婦幼院區', packages: [packages.A, packages.C, packages.E] },
        { branchId: 4, branchName: '中興院區', packages: [packages.B, packages.D, packages.E] },
        { branchId: 5, branchName: '陽明院區', packages: [packages.B, packages.D] },
        { branchId: 6, branchName: '松德院區', packages: [packages.C, packages.D] },
        { branchId: 7, branchName: '林森中醫院區', packages: [packages.C, packages.D, packages.E] },
      ],
    };
  }
}