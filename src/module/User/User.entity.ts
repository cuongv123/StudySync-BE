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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // -------------------------------
  // RELATIONS
  // -------------------------------
}
