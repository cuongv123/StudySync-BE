import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ 
    description: 'Tên người dùng', 
    example: 'john_doe',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'Username phải từ 3 đến 50 ký tự' })
  username?: string;

  @ApiProperty({ 
    description: 'Số điện thoại', 
    example: '0123456789',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^(0|\+84)[3-9][0-9]{8}$/, { 
    message: 'Số điện thoại không hợp lệ' 
  })
  phoneNumber?: string;

  @ApiProperty({ 
    description: 'Mã số sinh viên', 
    example: 'SV001234',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(6, 20, { message: 'Mã số sinh viên phải từ 6 đến 20 ký tự' })
  studentId?: string;

  @ApiProperty({ 
    description: 'Chuyên ngành của sinh viên', 
    example: 'Công nghệ thông tin',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Chuyên ngành phải từ 2 đến 100 ký tự' })
  major?: string;
}