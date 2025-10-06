import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGroupDto {
  @ApiProperty({
    description: 'Tên nhóm mới',
    example: 'Nhóm học Toán A1 - Updated',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  groupName?: string;

  @ApiProperty({
    description: 'Mô tả mới',
    example: 'Mô tả đã được cập nhật',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}