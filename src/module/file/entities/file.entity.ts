import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../User/User.entity';
import { StudyGroup } from '../../group/entities/group.entity';
import { FileType } from '../../../common/enums/file-type.enum';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  originalName: string;

  @Column('text')
  path: string;

  @Column('text', { nullable: true })
  url?: string;

  @Column('bigint')
  size: number; // bytes

  @Column({ length: 100 })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: FileType,
    default: FileType.PERSONAL,
  })
  type: FileType;

  @Column('uuid')
  uploaderId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'uploaderId' })
  uploader: User;

  @Column({ nullable: true })
  groupId?: number;

  @ManyToOne(() => StudyGroup, { nullable: true })
  @JoinColumn({ name: 'groupId' })
  group?: StudyGroup;

  @Column({ nullable: true })
  parentId?: number;

  @ManyToOne(() => File, file => file.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: File;

  @OneToMany(() => File, file => file.parent)
  children?: File[];

  @Column({ default: false })
  isFolder: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'uploadedAt' })
  uploadedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
