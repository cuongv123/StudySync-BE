import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  username?: string;

  @Column()
  roleId: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  tokenOTP?: string;
}
