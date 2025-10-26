import { Repository } from 'typeorm';
import { User } from './entities/User.entity';
import { UpdatePasswordDto } from './dto/update-password';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role } from 'src/common/enums/role.enum';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByUsername(username: string): Promise<User | null>;
    updateProfile(userId: string, dto: UpdateUserDto): Promise<User>;
    updateUserProfile(userId: string, dto: UpdateProfileDto): Promise<Omit<User, 'password' | 'tokenOTP' | 'otpExpiry'>>;
    updatePassword(userId: string, dto: UpdatePasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(userId: string, newPassword: string): Promise<{
        message: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    findByEmail(email: string): Promise<User | null>;
    create(userData: Partial<User>): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    findUserByToken(tokenOTP: string): Promise<User>;
    updateUser(user: User): Promise<User>;
    assignRole(userId: string, role: Role): Promise<{
        message: string;
        user: any;
    }>;
}
