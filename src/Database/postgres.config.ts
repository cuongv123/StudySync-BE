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
// Subscription entities
import { SubscriptionPlan } from 'src/module/subscription/entities/subscription-plan.entity';
import { UserSubscription } from 'src/module/subscription/entities/user-subscription.entity';
import { SubscriptionPayment } from 'src/module/subscription/entities/subscription-payment.entity';
import { File as FileEntity } from 'src/module/file/entities/file.entity';
import { UserStorage } from 'src/module/file/entities/user-storage.entity';
import { GroupStorage } from 'src/module/file/entities/group-storage.entity';
import { VideoCall } from 'src/module/video-call/entities/video-call.entity';
import { CallParticipant } from 'src/module/video-call/entities/call-participant.entity';
import { AiQueryHistory } from 'src/module/ai-chat/entities/ai-query-history.entity';
import { Conversation } from 'src/module/ai-chat/entities/conversation.entity';
import { Review } from 'src/module/review/entities/review.entity';
import { GroupEvent } from 'src/module/group-event/entities/group-event.entity';
import { EventParticipant } from 'src/module/group-event/entities/event-participant.entity';

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
            entities: [
              User, 
              Token, 
              StudyGroup, 
              GroupMember, 
              GroupInvitation, 
              Notification, 
              Task, 
              Message, 
              SubscriptionPlan, 
              UserSubscription, 
              SubscriptionPayment, 
              FileEntity, 
              UserStorage, 
              GroupStorage, 
              VideoCall, 
              CallParticipant, 
              AiQueryHistory, 
              Conversation, 
              Review,
              GroupEvent,
              EventParticipant
            ],
            migrations: [__dirname + '/../migrations/*{.ts,.js}'],
            synchronize: false, // ✅ An toàn - không động Supabase
            logging: ['query', 'error'],
            retryAttempts: 5,
            retryDelay: 3000,
            ssl: {
              rejectUnauthorized: false, // Cần thiết cho Supabase
            },
            // ✅ Performance: Connection pooling
            extra: {
              max: 20, // Maximum pool connections
              min: 5,  // Minimum pool connections
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 2000,
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
          entities: [
            User, 
            Token, 
            StudyGroup, 
            GroupMember, 
            GroupInvitation, 
            Notification, 
            Task, 
            Message, 
            SubscriptionPlan, 
            UserSubscription, 
            SubscriptionPayment, 
            FileEntity, 
            UserStorage, 
            GroupStorage, 
            VideoCall, 
            CallParticipant, 
            AiQueryHistory, 
            Conversation, 
            Review,
            GroupEvent,
            EventParticipant
          ],
          migrations:
            process.env.NODE_ENV === 'production'
              ? ['dist/migrations/*.js']
              : ['../migrations/*.ts'],
          synchronize: true, // cho phép sync nhanh ở local
          logging: true,
          retryAttempts: 5,
          retryDelay: 3000,
          // ✅ Performance: Connection pooling
          extra: {
            max: 10, // Smaller pool for local dev
            min: 2,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
