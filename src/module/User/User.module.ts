// src/modules/user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './User.entity';
import { UsersService } from './User.service';
import { UsersController } from './User.controller';
import { AdminUsersController } from './admin.controller';


@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController , AdminUsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UserModule {}
