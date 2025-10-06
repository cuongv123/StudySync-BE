import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty({
    description: 'Email của người được mời (phải isVerified = true)',
    example: 'member@example.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  memberEmail: string;

  @ApiProperty({
    description: 'Lời nhắn kèm theo lời mời (tùy chọn)',
    example: 'Mời bạn tham gia nhóm học Toán cao cấp',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Lời nhắn không được quá 500 ký tự' })
  message?: string;
}