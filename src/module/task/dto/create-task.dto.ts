import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../../../common/enums/task-status.enum';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Tiêu đề của task',
    example: 'Hoàn thành báo cáo chương 1',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết về task',
    example: 'Viết báo cáo chương 1 về tổng quan dự án, tối thiểu 5 trang',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID của thành viên được giao task',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  assignedTo: string;

  @ApiProperty({
    description: 'Thời hạn hoàn thành (ISO 8601 format)',
    example: '2025-10-15T23:59:59.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  deadline: string;

  @ApiPropertyOptional({
    description: 'Độ ưu tiên của task',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
