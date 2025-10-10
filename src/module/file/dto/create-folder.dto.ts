import { IsString, IsInt, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ 
    description: 'Tên folder', 
    example: 'Documents',
    maxLength: 255 
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Parent folder ID', 
    example: 1 
  })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ 
    description: 'Group ID (nếu tạo folder cho group)', 
    example: 7 
  })
  @IsOptional()
  @IsInt()
  groupId?: number;
}
