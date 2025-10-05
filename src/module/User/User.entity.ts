
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';


@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column({ unique: true })
  username: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
  @Column({ default: false })
  isVerified: boolean;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: true })
  tokenOTP?: string | null;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  otpExpiry?: Date | null;

  @ApiProperty({ enum: Role, isArray: true })
  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.USER],
  })
  role: Role[];

  @ApiProperty()
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Số điện thoại của user',
    example: '0123456789'
  })
  @Column({ type: 'varchar', length: 15, nullable: true })
  phoneNumber?: string | null;

  @ApiProperty({
    description: 'Mã số sinh viên',
    example: 'SV001234'
  })
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true })
  studentId?: string | null;

  @ApiProperty({
    description: 'Chuyên ngành của sinh viên',
    example: 'Công nghệ thông tin'
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  major?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}

