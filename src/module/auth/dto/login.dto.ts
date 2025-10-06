import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsEmail({},{ message: 'Email Không Hợp Lệ' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Mật Khẩu Không Được Để Trống' })
  @IsString()
  @MinLength(6, { message: 'Mật Khẩu Phải Có Ít Nhất 6 Ký Tự' })
  password: string;
}