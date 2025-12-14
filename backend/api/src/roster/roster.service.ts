import { Injectable } from '@nestjs/common';

interface RosterRecord {
  id: number;
  groupCode: string;
  fileName: string;
  uploadedAt: Date;
}

@Injectable()
export class RosterService {
  private records: RosterRecord[] = [];
  private nextId = 1;

  saveUpload(data: { groupCode: string; fileName: string }) {
    const record: RosterRecord = {
      id: this.nextId++,
      groupCode: data.groupCode,
      fileName: data.fileName,
      uploadedAt: new Date(),
    };

    this.records.push(record);

    return {
      message: '上傳並儲存成功（目前為後端假資料）',
      record,
    };
  }
}
