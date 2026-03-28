import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { HealthExaminationPackageEntity } from './entities/health-examination-package.entity';
import { HospitalBranchEntity } from '../branches/entities/hospital-branch.entity';
import { BranchPackageEntity } from '../branch-packages/entities/branch-package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HealthExaminationPackageEntity,
      HospitalBranchEntity,
      BranchPackageEntity,
    ]),
  ],
  controllers: [PackagesController],
  providers: [PackagesService],
  exports: [PackagesService],
})
export class PackagesModule {}