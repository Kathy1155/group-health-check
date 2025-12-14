import { Body, Controller, Post } from '@nestjs/common';
import { RosterService } from './roster.service';

@Controller('roster')
export class RosterController {
  constructor(private readonly rosterService: RosterService) {}

  @Post()
  upload(
    @Body()
    body: {
      groupCode: string;
      fileName: string;
    },
  ): any {
    return this.rosterService.saveUpload(body);
  }
}
