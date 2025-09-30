// update-user.dto.ts (partial, dùng PartialType nếu dùng class-transformer)
import {
  IsOptional,
  IsEmail,
  IsString,
  IsBoolean,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/common/enums/role.enum';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ enum: Role, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  role?: Role[];
}
