import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request, 
  ParseIntPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { GetNotificationsDto, MarkAsReadDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo của user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiQuery({ name: 'types', required: false, isArray: true })
  async getNotifications(
    @Request() req: any,
    @Query() query: GetNotificationsDto
  ) {
    return this.notificationService.getNotifications(req.user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Lấy số lượng thông báo chưa đọc' })
  async getUnreadCount(@Request() req: any) {
    return this.notificationService.getUnreadCount(req.user.id);
  }

  @Patch('mark-as-read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  async markAsRead(
    @Request() req: any,
    @Body() markAsReadDto: MarkAsReadDto
  ) {
    return this.notificationService.markAsRead(
      req.user.id, 
      markAsReadDto.notificationIds
    );
  }

  @Patch('mark-all-as-read')
  @ApiOperation({ summary: 'Đánh dấu tất cả thông báo đã đọc' })
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thông báo' })
  async deleteNotification(
    @Request() req: any,
    @Param('id', ParseIntPipe) notificationId: number
  ) {
    return this.notificationService.deleteNotification(
      req.user.id, 
      notificationId
    );
  }
}