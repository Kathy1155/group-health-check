import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'reservation' })
export class ReservationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'reservation_id' })
  reservationId: number;

  @Column({ type: 'bigint', name: 'participant_id' })
  participantId: number;

  @Column({ type: 'bigint', name: 'package_id' })
  packageId: number;

  @Column({ type: 'bigint', name: 'slot_id' })
  slotId: number;

  @Column({ type: 'bigint', name: 'medical_profile_id', nullable: true })
  medicalProfileId: number | null;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'quota_status',
    default: 'reserved',
  })
    quotaStatus: 'pending' | 'confirmed' | 'cancelled';

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}