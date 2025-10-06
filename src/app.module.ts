import { Module } from '@nestjs/common';
import { UserModule } from './module/User/User.module';
import { DatabaseModule } from './Database/postgres.config';
import { AuthModule } from './module/auth/auth.module';
import { TokenModule } from './module/token/token.module';
import { MailModule } from './shared/mail/mail.module';
import { GroupModule } from './module/group/group.module';
import { NotificationModule } from './module/notification/notification.module';


@Module({
    imports: [UserModule, DatabaseModule, AuthModule, TokenModule, MailModule, GroupModule, NotificationModule],
})
export class AppModule {}
