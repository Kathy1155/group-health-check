import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('staff_user')
export class StaffUserEntity {
    @PrimaryGeneratedColumn()
    user_id!: number;

    @Column({ length: 20, unique: true })
    staff_code!: string;

    @Column({ length: 50 })
    staff_name!: string;

    @Column({ length: 100, unique: true })
    staff_email!: string;

    @Column({ length: 255 })
    password!: string;

    @Column({
    type: 'enum',
    enum: ['Business', 'HealthExamination', 'Admin'],
    })
    staff_role!: 'Business' | 'HealthExamination' | 'Admin';

    @Column({ default: false })
    staff_isDisable!: boolean;
}