import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../../../common/enums/task-status.enum';

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Tiêu đề của task',
    example: 'Hoàn thành báo cáo chương 1 (cập nhật)',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết về task',
    example: 'Viết báo cáo chương 1 về tổng quan dự án',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Thời hạn hoàn thành (ISO 8601 format)',
    example: '2025-10-20T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({
    description: 'Độ ưu tiên của task',
    enum: TaskPriority,
    example: TaskPriority.URGENT,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
