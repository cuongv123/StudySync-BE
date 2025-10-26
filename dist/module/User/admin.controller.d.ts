import { UsersService } from './User.service';
import { ResetPasswordDto } from './dto/reset-password';
import { AssignRoleDto } from './dto/assign-role.dto';
export declare class AdminUsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("./entities/User.entity").User[]>;
    findOneById(id: string): Promise<import("./entities/User.entity").User>;
    resetPassword(id: string, dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    assignRole(assignRoleDto: AssignRoleDto): Promise<{
        message: string;
        user: any;
    }>;
}
