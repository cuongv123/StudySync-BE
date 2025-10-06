import { IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinGroupRequestDto {
  @ApiProperty({
    description: 'Lời nhắn xin gia nhập nhóm (tùy chọn)',
    example: 'Em muốn tham gia nhóm học Toán cao cấp ạ!',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Lời nhắn không được quá 500 ký tự' })
  message?: string;
}

