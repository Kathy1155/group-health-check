import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { PackagesService } from './packages.service';
import { UpdatePackageBranchesDto } from './dto/update-package-branches.dto';

@Controller()
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get('packages')
  findAllPackages() {
    return this.packagesService.findAllPackages();
  }

  @Get('branches')
  findAllBranches() {
    return this.packagesService.findAllBranches();
  }

  @Get('packages/:packageId/branches')
  findPackageBranches(
    @Param('packageId', ParseIntPipe) packageId: number,
  ) {
    return this.packagesService.findPackageBranches(packageId);
  }

  @Put('packages/:packageId/branches')
  savePackageBranches(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Body() dto: UpdatePackageBranchesDto,
  ) {
    return this.packagesService.savePackageBranches(packageId, dto);
  }
}