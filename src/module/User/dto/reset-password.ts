import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Mật khẩu mới để reset (ít nhất 6 ký tự)',
    example: 'NewResetPass789',
  })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}