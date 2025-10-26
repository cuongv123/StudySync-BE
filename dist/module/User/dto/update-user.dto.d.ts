import { Role } from 'src/common/enums/role.enum';
export declare class UpdateUserDto {
    email?: string;
    username?: string;
    isVerified?: boolean;
    isActive?: boolean;
    role?: Role[];
}
