import { DataSource } from 'typeorm';
// Update the import path to match the actual location and filename of User.entity.ts
import { User } from '../module/User/User.entity';
import * as dotenv from 'dotenv';
import { Token } from 'src/module/token/token.entity';
import { StudyGroup } from '../module/group/entities/group.entity';
import { GroupMember } from '../module/group/entities/group-member.entity';
import { GroupInvitation } from '../module/group/entities/group-invitation.entity';
import { Notification } from '../module/notification/entities/notification.entity';
dotenv.config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // sử dụng connection string Supabase
  entities: [User, Token, StudyGroup, GroupMember, GroupInvitation, Notification], // 
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // tắt vì bạn dùng migrations
  logging: true,
  ssl: {
    rejectUnauthorized: false, // Cần thiết cho Supabase
  },
  connectTimeoutMS: 60000, // 60 seconds timeout
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
