import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'time_slot' })
export class TimeSlotEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
    name: 'slot_id',
  })
  slotId: number;

  @Column({ type: 'date', name: 'slot_date' })
  slotDate: string;

  @Column({ type: 'time', name: 'slot_startTime' })
  slotStartTime: string;

  @Column({ type: 'time', name: 'slot_endTime' })
  slotEndTime: string;

  @Column({ type: 'int', name: 'slot_capacity', default: 20 })
  slotCapacity: number;

  @Column({ type: 'int', name: 'slot_reserved_count', default: 0 })
  slotReservedCount: number;

  @Column({
    type: 'enum',
    enum: ['open', 'closed', 'full'],
    name: 'slot_status',
    default: 'open',
  })
  slotStatus: 'open' | 'closed' | 'full';

  @Column({
    type: 'bigint',
    unsigned: true,
    name: 'branch_package_id',
  })
  branchPackageId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}