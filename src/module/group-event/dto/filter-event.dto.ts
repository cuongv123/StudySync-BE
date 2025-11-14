import {
  IsOptional,
  IsInt,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../../../common/enums/event-type.enum';
import { Type } from 'class-transformer';

export class FilterEventDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ID nhóm học',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  groupId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo loại sự kiện',
    enum: EventType,
    example: EventType.MEETING,
  })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu khoảng thời gian (ISO 8601)',
    example: '2025-06-30T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc khoảng thời gian (ISO 8601)',
    example: '2025-07-07T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
