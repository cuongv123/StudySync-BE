import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../User/User.entity';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn() // Sửa thành auto-increment chuẩn
  id: number;

  @Column({
    type: 'simple-array',
    default: () => 'ARRAY[]::text[]', // Default array rỗng
  })
  refeshtokenused: string[];

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}