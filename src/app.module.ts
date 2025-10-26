import { Module } from '@nestjs/common';
import { UserModule } from './module/User/User.module';
import { DatabaseModule } from './Database/postgres.config';
import { AuthModule } from './module/auth/auth.module';
import { TokenModule } from './module/token/token.module';
import { MailModule } from './shared/mail/mail.module';
import { GroupModule } from './module/group/group.module';
import { NotificationModule } from './module/notification/notification.module';
import { TaskModule } from './module/task/task.module';
import { ChatModule } from './module/chat/chat.module';
import { SubscriptionModule } from './module/subscription/subscription.module';
import { PaymentModule } from './module/payment/payment.module';
import { FileModule } from './module/file/file.module';
import { VideoCallModule } from './module/video-call/video-call.module';
import { AiChatModule } from './module/ai-chat/ai-chat.module';


@Module({
    imports: [UserModule, DatabaseModule, AuthModule, TokenModule, MailModule, GroupModule, NotificationModule, TaskModule, ChatModule, SubscriptionModule, PaymentModule, FileModule, VideoCallModule, AiChatModule],
})
export class AppModule {}
