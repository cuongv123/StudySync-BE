import { IsEnum, IsOptional, IsInt, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FileType } from '../../../common/enums/file-type.enum';

export class UploadFileDto {
  @ApiProperty({ 
    enum: FileType, 
    description: 'Loại file: personal (100MB) hoặc group (1GB)',
    example: 'personal' 
  })
  @IsEnum(FileType)
  type: FileType;

  @ApiPropertyOptional({ 
    description: 'Group ID (bắt buộc nếu type=group)', 
    example: 7 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  groupId?: number;

  @ApiPropertyOptional({ 
    description: 'Parent folder ID (để upload vào folder)', 
    example: 1 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ 
    description: 'Tên tùy chỉnh cho file', 
    maxLength: 255 
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customName?: string;
}
