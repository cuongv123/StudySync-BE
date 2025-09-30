import { Module } from '@nestjs/common';
import { UserModule } from './module/User/User.module';
import { DatabaseModule } from './Database/postgres.config';
import { AuthModule } from './module/auth/auth.module';
import { TokenModule } from './module/token/token.module';

@Module({
  imports: [UserModule, DatabaseModule, AuthModule, TokenModule],
})
export class AppModule {}
