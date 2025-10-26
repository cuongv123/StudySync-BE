import { DataSource } from 'typeorm';
// Update the import path to match the actual location and filename of User.entity.ts
import { User } from '../module/User/entities/User.entity';
import * as dotenv from 'dotenv';
import { Token } from 'src/module/token/token.entity';
import { StudyGroup } from '../module/group/entities/group.entity';
import { GroupMember } from '../module/group/entities/group-member.entity';
import { GroupInvitation } from '../module/group/entities/group-invitation.entity';
import { Notification } from '../module/notification/entities/notification.entity';
import { Task } from 'src/module/task/entities/task.entity';
import { Message } from 'src/module/chat/entities/message.entity';
import { SubscriptionPlan } from '../module/subscription/entities/subscription-plan.entity';
import { UserSubscription } from '../module/subscription/entities/user-subscription.entity';
import { SubscriptionPayment } from '../module/subscription/entities/subscription-payment.entity';
import { File } from '../module/file/entities/file.entity';
import { UserStorage } from '../module/file/entities/user-storage.entity';
import { GroupStorage } from '../module/file/entities/group-storage.entity';
dotenv.config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // sử dụng connection string Supabase
  entities: [User, Token, StudyGroup, GroupMember, GroupInvitation, Notification, Task, Message, SubscriptionPlan, UserSubscription, SubscriptionPayment, File, UserStorage, GroupStorage], // 
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
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
