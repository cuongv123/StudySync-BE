import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './User.service';
import { ApiOkResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { UpdatePasswordDto } from './dto/update-password';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResetPasswordDto } from './dto/reset-password';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/RolesGuard';

@Controller('users')
@ApiTags('User')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/password')
  @Roles(Role.USER)
  @ApiOkResponse({ schema: { example: { message: 'Password successfully updated' }}})
  async updatePassword(@Req() req, @Body() dto: UpdatePasswordDto) {
    const userId = (req.user as any).sub;
    return this.usersService.updatePassword(userId, dto);
  }

  @Get('me/profile')
  @Roles(Role.USER)
  @ApiOkResponse({
    description: 'Lấy thông tin profile của user hiện tại',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        username: 'john_doe',
        isVerified: true,
        role: ['user'],
        isActive: true,
        phoneNumber: '0123456789',
        studentId: 'SV001234',
        major: 'Công nghệ thông tin',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  async getProfile(@Req() req: any) {
    const userId = (req.user as any).sub;
    const user = await this.usersService.findOne(userId);
    const { password, tokenOTP, otpExpiry, ...userResponse } = user;
    return userResponse;
  }

  @Patch('me/profile')
  @Roles(Role.USER)
  @ApiOkResponse({
    description: 'Cập nhật profile thành công. Trả về tất cả thông tin user bao gồm email nhưng email không thể sửa',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        username: 'john_doe_updated',
        isVerified: true,
        role: ['user'],
        isActive: true,
        phoneNumber: '0987654321',
        studentId: 'SV005678',
        major: 'Kỹ thuật phần mềm',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z'
      }
    }
  })
  async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = (req.user as any).sub;
    return this.usersService.updateUserProfile(userId, updateProfileDto);
  }
}