import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UsersService } from './User.service';
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { UpdatePasswordDto } from './dto/update-password';
import { ResetPasswordDto } from './dto/reset-password';
import { User } from './User.entity';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/RolesGuard';

@Controller('users')
@ApiTags('Users')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles(Role.USER)
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Password successfully updated',
      },
    },
  })

  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  async updatePassword(@Req() req, @Body() dto: UpdatePasswordDto) {
    const { userId } = req.user; // phải đúng key mà JwtStrategy trả về
    return this.usersService.updatePassword(userId, dto);
  }
  /**
   * [ADMIN] can reset password of user
   */
  @Patch(':id/password')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    schema: {
      example: {
        message: 'Password reset successfully',
      },
    },
  })
  async resetPassword(
    @Param('id') id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.usersService.resetPassword(id, resetPasswordDto.newPassword);
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