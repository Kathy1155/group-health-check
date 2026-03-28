import {
  IsArray,
  ArrayUnique,
  IsIn,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePackageBranchesDto {
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  selectedBranchIds: number[];

  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';
}