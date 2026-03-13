<<<<<<< Updated upstream
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { GroupEntity } from '../groups/group.entity';
import { GroupParticipantEntity } from './group-participant.entity';
=======
import { Injectable } from '@nestjs/common';

export interface RosterRecord {
  id: number;
  groupCode: string;
  fileName: string;
  uploadedAt: Date;
}
>>>>>>> Stashed changes

// ✅ 名冊中的「員工基本資料」
export interface RosterMember {
  groupCode: string;
  idNumber: string;
  name: string;
  phone: string;
  birthday: string; // YYYY-MM-DD
}

@Injectable()
export class RosterService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,

<<<<<<< Updated upstream
    @InjectRepository(GroupParticipantEntity)
    private readonly participantRepo: Repository<GroupParticipantEntity>,
  ) {}
=======
  // ✅ 假名冊資料：先讓前端可以查到資料（之後再換成 DB）
  private members: RosterMember[] = [
    {
      groupCode: 'FB12345678',
      idNumber: 'A123456789',
      name: '王小明',
      phone: '0912345678',
      birthday: '2020-07-03',
    },
    {
      groupCode: 'FB12345678',
      idNumber: 'B234567890',
      name: '陳小華',
      phone: '0922333444',
      birthday: '1997-05-12',
    },
  ];

  saveUpload(data: { groupCode: string; fileName: string }) {
    const record: RosterRecord = {
      id: this.nextId++,
      groupCode: data.groupCode,
      fileName: data.fileName,
      uploadedAt: new Date(),
    };
>>>>>>> Stashed changes

  private normalizeGender(value: string): 'Male' | 'Female' | null {
  const raw = value.trim().toUpperCase();

  if (raw === 'M' || raw === 'MALE') return 'Male';
  if (raw === 'F' || raw === 'FEMALE') return 'Female';

  return null;
}

private normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  // Excel 吃掉前導 0 時，若只剩 9 碼，自動補回
  if (digits.length === 9) {
    return `0${digits}`;
  }

  return digits;
}

private normalizeBirthDate(value: string): string {
  const raw = value.trim();

  // 接受 yyyy-mm-dd 或 yyyy/m/d 或 yyyy/m/dd
  const match = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!match) return raw;

  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
  async importCsv(groupCode: string, file: any) {
    const group = await this.groupRepo.findOne({
      where: { groupCode },
    });

    if (!group) {
      throw new NotFoundException('查無此團體代碼');
    }

    const csvText = file.buffer.toString('utf-8');

  let records: any[];
    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch {
      throw new BadRequestException('CSV 解析失敗，請確認檔案格式是否正確');
    }

    const normalizedRecords = records.map((row) => {
      const normalizedRow: Record<string, any> = {};

      for (const key of Object.keys(row)) {
        const cleanKey = key.replace(/^\uFEFF/, '');
        normalizedRow[cleanKey] = row[key];
      }

      return normalizedRow;
    });

    const expectedHeaders = [
      'name',
      'id_number',
      'gender',
      'birth_date',
      'phone',
      'email',
      'address',
      'medical_profile_id',
    ];

    const actualHeaders =
      normalizedRecords.length > 0 ? Object.keys(normalizedRecords[0]) : [];

    const missingHeaders = expectedHeaders.filter(
      (header) => !actualHeaders.includes(header),
    );
    const extraHeaders = actualHeaders.filter(
      (header) => !expectedHeaders.includes(header),
    );

    if (missingHeaders.length > 0 || extraHeaders.length > 0) {
      throw new BadRequestException({
        message: 'CSV 欄位格式錯誤，無法匯入',
        details: [
          ...(missingHeaders.length > 0
            ? [`缺少欄位：${missingHeaders.join(', ')}`]
            : []),
          ...(extraHeaders.length > 0
            ? [`多餘欄位：${extraHeaders.join(', ')}`]
            : []),
        ],
      });
    }

    const errors: string[] = [];

    const idRegex = /^[A-Z][12]\d{8}$/;
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const birthDateRegex = /^\d{4}-\d{2}-\d{2}$/;

    const participants: Partial<GroupParticipantEntity>[] = normalizedRecords.map(
      (row, index) => {
        const rowNo = index + 2;

        const name = String(row.name ?? '').trim();
const idNumber = String(row.id_number ?? '').trim().toUpperCase();

const genderRaw = String(row.gender ?? '').trim();
const gender = this.normalizeGender(genderRaw);

const birthDateRaw = String(row.birth_date ?? '').trim();
const birthDate = this.normalizeBirthDate(birthDateRaw);

const phoneRaw = String(row.phone ?? '').trim();
const phone = this.normalizePhone(phoneRaw);

const email = String(row.email ?? '').trim();
const address = String(row.address ?? '').trim();
const medicalProfileIdRaw = String(row.medical_profile_id ?? '').trim();

        if (!name) {
  errors.push(`第 ${rowNo} 列：name 不可空白`);
        }

        if (!idRegex.test(idNumber)) {
          errors.push(`第 ${rowNo} 列：id_number 格式錯誤`);
        }

        if (!gender) {
          errors.push(`第 ${rowNo} 列：gender 只能是 M、F、Male 或 Female`);
        }

        if (!birthDateRegex.test(birthDate)) {
          errors.push(`第 ${rowNo} 列：birth_date 格式錯誤，需為 YYYY-MM-DD`);
        }

        if (!phoneRegex.test(phone)) {
          errors.push(`第 ${rowNo} 列：phone 格式錯誤，需為 10 碼數字`);
        }

        if (!emailRegex.test(email)) {
          errors.push(`第 ${rowNo} 列：email 格式錯誤`);
        }

        if (!address) {
          errors.push(`第 ${rowNo} 列：address 不可空白`);
        }

        let medicalProfileId: number | null = null;
        if (medicalProfileIdRaw !== '') {
          if (!/^\d+$/.test(medicalProfileIdRaw)) {
            errors.push(`第 ${rowNo} 列：medical_profile_id 必須為數字或留空`);
          } else {
            medicalProfileId = Number(medicalProfileIdRaw);
          }
        }

        return {
          name,
          idNumber,
          gender: gender ?? 'Male',
          birthDate,
          phone,
          email,
          address,
          medicalProfileId,
          groupId: group.groupId,
          dataSource: 'company',
          createByUserId: null,
          updateByUserId: null,
        };
      },
    );

    if (errors.length > 0) {
      throw new BadRequestException({
        message: '名冊資料格式錯誤，無法匯入',
        details: errors,
      });
    }

    await this.participantRepo.save(participants);

    return {
      message: '名冊匯入成功',
      count: participants.length,
    };
  }
<<<<<<< Updated upstream
=======

  // ✅ 讓前端可用 groupCode + idNumber 查到該員工基本資料
  findOneByGroupAndId(groupCode: string, idNumber: string): RosterMember | null {
    const member = this.members.find(
      (m) => m.groupCode === groupCode && m.idNumber === idNumber,
    );
    return member ?? null;
  }
>>>>>>> Stashed changes
}