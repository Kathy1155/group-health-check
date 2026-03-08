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

  async findAll() {
    return this.groupRepo.find({ order: { groupId: 'DESC' as any } });
  }

  async findOne(id: number) {
    const found = await this.groupRepo.findOne({ where: { groupId: id } });
    if (!found) throw new NotFoundException('查無此團體');
    return found;
  }

  async findByCode(code: string) {
    const found = await this.groupRepo.findOne({ where: { groupCode: code } });
    if (!found) throw new NotFoundException('查無此團體代碼');
    return found;
  }

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
}