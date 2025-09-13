import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Mật khẩu cũ của người dùng',
    example: 'OldPassword123',
  })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'Mật khẩu mới của người dùng, phải có ít nhất 6 ký tự',
    example: 'NewPassword456',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}