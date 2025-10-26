import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../User/entities/User.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int', comment: 'Rating 1-5 stars (REQUIRED)' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  // Admin reply
  @Column({ type: 'text', nullable: true })
  adminReply: string;

  @Column({ type: 'uuid', nullable: true })
  repliedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  repliedAt: Date;

  // Public visibility (admin can hide)
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'repliedBy' })
  admin: User;
}
