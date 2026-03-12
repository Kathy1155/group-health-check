import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'group_participant' })
export class GroupParticipantEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'group_participant_id' })
  groupParticipantId: number;

  @Column({ type: 'varchar', length: 50, name: 'group_participant_name' })
  name: string;

  @Column({ type: 'char', length: 10, name: 'id_number' })
  idNumber: string;

  @Column({ type: 'enum', enum: ['Male', 'Female'], name: 'gender' })
  gender: 'Male' | 'Female';

  @Column({ type: 'date', name: 'birth_date' })
  birthDate: string;

  @Column({ type: 'varchar', length: 20, name: 'group_participant_phone' })
  phone: string;

  @Column({ type: 'varchar', length: 100, name: 'group_participant_email' })
  email: string;

  @Column({ type: 'varchar', length: 200, name: 'group_participant_address' })
  address: string;

  @Column({ type: 'varchar', length: 20, name: 'dataSource' })
  dataSource: string;

  @Column({ type: 'bigint', name: 'medical_profile_id', nullable: true })
  medicalProfileId: number | null;

  @Column({ type: 'bigint', name: 'group_id' })
  groupId: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'bigint', name: 'create_by_user_id', nullable: true })
  createByUserId: number | null;

  @Column({ type: 'bigint', name: 'update_by_user_id', nullable: true })
  updateByUserId: number | null;
}