import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import express from 'express';  
import { UpdatePasswordDto } from './dto/update-password';
import { ResetPasswordDto } from './dto/reset-password';
import { User } from './user.entity';

@Controller('users')
@ApiTags('Users')
@ApiSecurity('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * [ADMIN] Get all users
   */
  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  /**
   * [ADMIN] Get user by user id
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  async findOneById(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * [USER] can change own password
   */
  @Patch('me/password')
  @Roles(Role.USER) // 👈 user (student) tự đổi password của mình
  @ApiOkResponse({
    schema: {
        example: {
          message: 'Password successfully updated',
        },
      },
    })
    updatePassword(
      @Body() updatePasswordDto: UpdatePasswordDto,
      @Req() req: any,
    ) {
      const { userId } = req.user;
  
      return this.usersService.updatePassword(userId, updatePasswordDto);
    }
  

  /**
   * [ADMIN] can reset password of user
   */
  @Patch(':id/password')
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: ResetPasswordDto })
  async resetPassword(@Param('id') id: string) {
    return this.usersService.resetPassword(id);
  }

  /**
   * [ADMIN] can delete user
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
