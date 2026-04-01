import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'medical_profile' })
export class MedicalProfileEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'medical_profile_id',
  })
  medicalProfileId: number;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'bloodType',
    nullable: true,
  })
  bloodType: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'allergies',
    nullable: true,
  })
  allergies: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'familyHistory',
    nullable: true,
  })
  familyHistory: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'chronicDiseases',
    nullable: true,
  })
  chronicDiseases: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'medications',
    nullable: true,
  })
  medications: string | null;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'lastUpdated',
  })
  lastUpdated: Date;
}