import { UsersService } from './User.service';
import { Role } from 'src/common/enums/role.enum';
import { UpdatePasswordDto } from './dto/update-password';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    updatePassword(req: any, dto: UpdatePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        username: string;
        isVerified: boolean;
        role: Role[];
        isActive: boolean;
        phoneNumber?: string | null;
        studentId?: string | null;
        major?: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<Omit<import("./entities/User.entity").User, "password" | "tokenOTP" | "otpExpiry">>;
}
