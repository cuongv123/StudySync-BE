import { IsString, IsInt, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileType } from '../../../common/enums/file-type.enum';

export class CreateFolderDto {
  @ApiProperty({ 
    description: 'Tên folder', 
    example: 'Tài liệu học tập',
    maxLength: 255 
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Loại folder: personal (cá nhân) hoặc group (nhóm)',
    enum: FileType,
    example: FileType.PERSONAL,
  })
  @IsEnum(FileType)
  type: FileType;

  @ApiPropertyOptional({ 
    description: 'ID của folder cha (nếu tạo folder con bên trong folder khác). Để trống nếu tạo folder ở ROOT',
    example: null,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ 
    description: 'ID của nhóm (BẮT BUỘC nếu type="group"). Bỏ trống nếu type="personal"',
    example: 7,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  groupId?: number;
}
