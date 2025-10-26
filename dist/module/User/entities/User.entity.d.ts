import { Role } from 'src/common/enums/role.enum';
export declare class User {
    id: string;
    email: string;
    username: string;
    password: string;
    isVerified: boolean;
    tokenOTP?: string | null;
    otpExpiry?: Date | null;
    role: Role[];
    isActive: boolean;
    phoneNumber?: string | null;
    studentId?: string | null;
    major?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
