import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartCallDto {
  @ApiProperty({ example: 4, description: 'ID của nhóm' })
  @IsInt()
  groupId: number;

  @ApiPropertyOptional({ example: 'Họp nhóm lần 1', description: 'Tiêu đề cuộc gọi' })
  @IsOptional()
  @IsString()
  callTitle?: string;
}
