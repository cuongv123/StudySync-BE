import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { Role } from 'src/common/enums/role.enum';

export class AssignRoleDto {
  @ApiProperty({
    description: 'ID của user cần cấp quyền',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'User ID phải là UUID hợp lệ' })
  userId: string;

  @ApiProperty({
    description: 'Chọn role cho user: "user" - Người dùng thông thường, "admin" - Quản trị viên hệ thống',
    example: Role.ADMIN,
    enum: Role,
    enumName: 'UserRole',
    default: Role.USER,
  })
  @IsNotEmpty({ message: 'Vui lòng chọn role' })
  @IsEnum(Role, { message: 'Role không hợp lệ. Vui lòng chọn user hoặc admin' })
  role: Role;
}   
