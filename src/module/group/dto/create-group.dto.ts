import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Tên nhóm học',
    example: 'Nhóm học Toán A1',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Tên nhóm không được để trống' })
  @IsString()
  @MaxLength(100, { message: 'Tên nhóm không được vượt quá 100 ký tự' })
  groupName: string;

  @ApiProperty({
    description: 'Mô tả về nhóm',
    example: 'Nhóm học chung môn Toán cao cấp A1',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}