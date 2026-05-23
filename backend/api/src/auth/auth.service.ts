import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StaffUserEntity } from './staff-user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(StaffUserEntity)
    private readonly staffUserRepository: Repository<StaffUserEntity>,
  ) {}

  async login(staffEmail: string, password: string) {
    const user = await this.staffUserRepository.findOne({
      where: { staff_email: staffEmail },
    });

    if (!user) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    if (user.staff_isDisable) {
      throw new UnauthorizedException('此帳號已停用');
    }

    if (user.password !== password) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    return {
      user_id: user.user_id,
      staff_name: user.staff_name,
      staff_email: user.staff_email,
      staff_role: user.staff_role,
    };
  }
}