import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../User/User.module';
import { Token } from './token.entity';
import { User } from '../User/User.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Token,User]), UserModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}