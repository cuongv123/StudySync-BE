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
import { ApiOkResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';
import { Roles } from 'src/decorator/roles.decorator';
import { UpdatePasswordDto } from './dto/update-password';
import { ResetPasswordDto } from './dto/reset-password';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/RolesGuard';

@Controller('users')
@ApiTags('User')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me/password')
  @Roles(Role.USER)
  @ApiOkResponse({
    schema: { example: { message: 'Password successfully updated' } },
  })
  async updatePassword(@Req() req, @Body() dto: UpdatePasswordDto) {
    const userId = req.user.sub;
    return this.usersService.updatePassword(userId, dto);
  }
}
