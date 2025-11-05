import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { Roles } from '../../decorator/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AdminService } from './admin.service';
import { AssignRoleDto } from '../User/dto/assign-role.dto';
import { ResetPasswordDto } from '../User/dto/reset-password';
import { GetUser } from '../../decorator/getuser.decorator';

@Controller('admin')
@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Admin Profile
  @Get('me')
  @ApiOkResponse({ description: 'Lấy thông tin profile của admin đang đăng nhập' })
  async getAdminProfile(@GetUser() user: any) {
    return this.adminService.getAdminProfile(user.id || user.userId || user.sub);
  }

  // Dashboard
  @Get('dashboard')
  @ApiOkResponse({ description: 'Lấy thống kê tổng quan cho admin dashboard' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  // User Management
  @Get('users')
  @ApiOkResponse({ description: 'Lấy danh sách tất cả users (không bao gồm admin hiện tại)' })
  async getAllUsers(@GetUser() user: any, @Query() query: any) {
    const adminId = user.id || user.userId || user.sub;
    return this.adminService.listUsers(adminId, query);
  }

  @Get('users/:id')
  @ApiOkResponse({ description: 'Lấy thông tin chi tiết user' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('users/:id/password')
  @ApiOkResponse({ description: 'Reset password cho user' })
  async resetUserPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.adminService.resetUserPassword(id, dto.newPassword);
  }

  @Delete('users/:id')
  @ApiOkResponse({ description: 'Xóa user' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/assign-role')
  @ApiOkResponse({ description: 'Gán role cho user' })
  async assignRole(@Body() dto: AssignRoleDto) {
    return this.adminService.assignRole(dto.userId, dto.role);
  }

  // Revenue & Subscriptions
  @Get('revenue/total')
  @ApiOkResponse({ description: 'Lấy tổng doanh thu' })
  async getTotalRevenue() {
    return this.adminService.getTotalRevenue();
  }

  @Get('subscriptions/stats')
  @ApiOkResponse({ description: 'Lấy thống kê subscriptions' })
  async getSubscriptionStats() {
    return this.adminService.getSubscriptionStats();
  }
}
