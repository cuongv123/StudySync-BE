import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { User } from 'src/module/User/User.entity';

@Entity({ name: 'study_groups' })
export class StudyGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}