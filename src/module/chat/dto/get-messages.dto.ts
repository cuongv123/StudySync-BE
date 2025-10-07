import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetMessagesDto {
  @ApiProperty({
    description: 'Số trang',
    example: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng tin nhắn mỗi trang',
    example: 50,
    default: 50,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiProperty({
    description: 'Lấy tin nhắn trước message ID này (để pagination)',
    example: 1000,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  beforeMessageId?: number;
}
