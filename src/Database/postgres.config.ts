import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from 'src/module/User/entities/User.entity';
import { Token } from 'src/module/token/token.entity';
import { StudyGroup } from 'src/module/group/entities/group.entity';
import { GroupMember } from 'src/module/group/entities/group-member.entity';
import { GroupInvitation } from 'src/module/group/entities/group-invitation.entity';
import { Notification } from 'src/module/notification/entities/notification.entity'; 
import { Task } from 'src/module/task/entities/task.entity';
import { Message } from 'src/module/chat/entities/message.entity';
<<<<<<< HEAD
// Payment entities
import { UserWallet } from 'src/module/payment/entities/user-wallet.entity';
import { WalletTransaction } from 'src/module/payment/entities/wallet-transaction.entity';
import { PaymentAttempt } from 'src/module/payment/entities/payment-attempt.entity';
import { SubscriptionPlan } from 'src/module/payment/entities/subscription-plan.entity';
import { UserSubscription } from 'src/module/payment/entities/user-subscription.entity';
import { Payment } from 'src/module/payment/entities/payment.entity';
=======
import { File as FileEntity } from 'src/module/file/entities/file.entity';
import { UserStorage } from 'src/module/file/entities/user-storage.entity';
import { GroupStorage } from 'src/module/file/entities/group-storage.entity';
import { VideoCall } from 'src/module/video-call/entities/video-call.entity';
import { CallParticipant } from 'src/module/video-call/entities/call-participant.entity';
>>>>>>> main

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          // ✅ Khi dùng Supabase (DATABASE_URL)
          return {
            type: 'postgres',
            url: databaseUrl,
<<<<<<< HEAD
            entities: [User, Token, StudyGroup, GroupMember, GroupInvitation, Notification, Task, Message, UserWallet, WalletTransaction, PaymentAttempt, SubscriptionPlan, UserSubscription, Payment], 
=======
            entities: [User, Token, StudyGroup, GroupMember, GroupInvitation, Notification, Task, Message, FileEntity, UserStorage, GroupStorage, VideoCall, CallParticipant], 
>>>>>>> main
            migrations: [__dirname + '/../migrations/*{.ts,.js}'],
            synchronize: false, // ✅ An toàn - không động Supabase
            logging: ['query', 'error'],
            retryAttempts: 5,
            retryDelay: 3000,
            ssl: {
              rejectUnauthorized: false, // Cần thiết cho Supabase
            },
          };
        }

        // ✅ Khi chạy local dev
        return {
          type: 'postgres',
          host: configService.get<string>('DEV_DB_HOST', 'localhost'),
          port: configService.get<number>('DEV_DB_PORT', 5432),
          username: configService.get<string>('DEV_DB_USERNAME', 'postgres'),
          password: configService.get<string>('DEV_DB_PASSWORD', ''),
          database: configService.get<string>('DEV_DB_DATABASE', 'studysync'),
          entities: [User, Token, StudyGroup, GroupMember, GroupInvitation, Notification, Task, Message, FileEntity, UserStorage, GroupStorage, VideoCall, CallParticipant], 
          migrations:
            process.env.NODE_ENV === 'production'
              ? ['dist/migrations/*.js']
              : ['../migrations/*.ts'],
          synchronize: true, // cho phép sync nhanh ở local
          logging: true,
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
