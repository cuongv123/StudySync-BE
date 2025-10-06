import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsArray, IsEnum, IsNumber } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class GetNotificationsDto {
  @ApiProperty({ required: false, description: 'Số trang' })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Số items per page' })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Lọc theo trạng thái đã đọc' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({ 
    required: false, 
    description: 'Lọc theo loại thông báo',
    enum: NotificationType,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  types?: NotificationType[];
}

export class MarkAsReadDto {
  @ApiProperty({ description: 'Danh sách ID notifications cần đánh dấu đã đọc' })
  @IsArray()
  @IsNumber({}, { each: true })
  notificationIds: number[];
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'Loại thông báo', enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Tiêu đề thông báo' })
  title: string;

  @ApiProperty({ description: 'Nội dung thông báo' })
  message: string;

  @ApiProperty({ description: 'ID người nhận' })
  userId: string;

  @ApiProperty({ required: false, description: 'ID nhóm liên quan' })
  @IsOptional()
  groupId?: number;

  @ApiProperty({ required: false, description: 'ID user liên quan' })
  @IsOptional()
  relatedUserId?: string;
}