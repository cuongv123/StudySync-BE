import { IsOptional, IsInt, IsEnum, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FileType } from '../../../common/enums/file-type.enum';

export class GetFilesDto {
  @ApiPropertyOptional({ description: 'Trang số', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng/trang', example: 20, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ 
    enum: FileType, 
    description: 'Lọc theo loại file',
    example: 'personal' 
  })
  @IsOptional()
  @IsEnum(FileType)
  type?: FileType;

  @ApiPropertyOptional({ 
    description: 'Parent folder ID (null = root)', 
    example: 1 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ 
    description: 'Group ID (để lấy files của group)', 
    example: 7 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  groupId?: number;

  @ApiPropertyOptional({ 
    description: 'Tìm kiếm theo tên file', 
    example: 'report' 
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Chỉ lấy folders', 
    example: false 
  })
  @IsOptional()
  @Type(() => Boolean)
  foldersOnly?: boolean;
}
