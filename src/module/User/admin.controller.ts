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

@Controller('admin')
@ApiTags('Admin')
@ApiSecurity('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findOneById(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/password')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    schema: { example: { message: 'Password reset successfully' } },
  })
  async resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, dto.newPassword);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
