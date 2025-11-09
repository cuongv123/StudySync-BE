import { IsEnum, IsOptional, IsInt, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FileType } from '../../../common/enums/file-type.enum';

export class UploadFileDto {
  @ApiProperty({ 
    enum: FileType, 
    description: 'Loại file: "personal" (cá nhân - giới hạn 100MB) hoặc "group" (nhóm - giới hạn 1GB)',
    example: FileType.PERSONAL,
  })
  @IsEnum(FileType)
  type: FileType;

  @ApiPropertyOptional({ 
    description: 'ID của nhóm (BẮT BUỘC nếu type="group"). Bỏ trống nếu type="personal"',
    example: 7,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  groupId?: number;

  @ApiPropertyOptional({ 
    description: 'ID của folder cha (nếu muốn upload vào folder). Để trống nếu upload vào ROOT',
    example: null,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ 
    description: 'Tên tùy chỉnh cho file (nếu không nhập sẽ dùng tên gốc)',
    example: 'Tài liệu học tập.pdf',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  customName?: string;
}
