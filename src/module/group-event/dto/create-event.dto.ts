import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsInt,
  IsBoolean,
  MaxLength,
  IsUUID,
  Min,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../../../common/enums/event-type.enum';

export class CreateEventDto {
  @ApiProperty({
    description: 'ID của nhóm học',
    example: 1,
  })
  @IsInt()
  groupId: number;

  @ApiProperty({
    description: 'Tiêu đề sự kiện',
    example: 'Học nhóm môn SWP391',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết về sự kiện',
    example: 'Thảo luận về Sprint 2 và phân công task',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Loại sự kiện',
    enum: EventType,
    example: EventType.MEETING,
  })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({
    description: 'Ngày giờ bắt đầu sự kiện (ISO 8601)',
    example: '2025-07-03T09:00:00Z',
  })
  @IsDateString()
  eventDate: string;

  @ApiPropertyOptional({
    description: 'Ngày giờ kết thúc sự kiện (ISO 8601)',
    example: '2025-07-03T11:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Địa điểm tổ chức sự kiện',
    example: 'Phòng E201, Tòa nhà E, FPT University',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @ApiPropertyOptional({
    description: 'Số phút trước sự kiện để nhắc nhở (15, 30, 60, 1440)',
    example: 30,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  reminderMinutes?: number;

  @ApiPropertyOptional({
    description: 'Sự kiện kéo dài cả ngày',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiPropertyOptional({
    description: 'Danh sách ID của members CẦN THAM GIA sự kiện (được note)',
    example: ['123e4567-e89b-12d3-a456-426614174000', '987e6543-e21b-45d3-a123-426614174001'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  participantIds?: string[];
}
