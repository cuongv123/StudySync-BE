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
import { UserWallet } from '../module/payment/entities/user-wallet.entity';
import { WalletTransaction } from '../module/payment/entities/wallet-transaction.entity';
import { Payment } from '../module/payment/entities/payment.entity';
import { PaymentAttempt } from '../module/payment/entities/payment-attempt.entity';
import { SubscriptionPlan } from '../module/payment/entities/subscription-plan.entity';
import { UserSubscription } from '../module/payment/entities/user-subscription.entity';
dotenv.config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // sử dụng connection string Supabase
  entities: [User, Token, StudyGroup, GroupMember, GroupInvitation, Notification, Task, Message, UserWallet, WalletTransaction, Payment, PaymentAttempt, SubscriptionPlan, UserSubscription], // 
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
