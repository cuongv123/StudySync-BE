import { AdminService } from './admin.service';
import { AssignRoleDto } from '../User/dto/assign-role.dto';
import { ResetPasswordDto } from '../User/dto/reset-password';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboard(): Promise<{
        totalUsers: number;
        totalRevenue: number;
        subscriptionStats: {
            byPlan: {
                planName: string;
                planId: number;
                activeSubscriptions: number;
            }[];
            total: number;
        };
        reviewStats: {};
    }>;
    getAllUsers(query: any): Promise<import("../User/entities/User.entity").User[]>;
    getUserById(id: string): Promise<import("../User/entities/User.entity").User>;
    resetUserPassword(id: string, dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    assignRole(dto: AssignRoleDto): Promise<{
        message: string;
        user: any;
    }>;
    getTotalRevenue(): Promise<{
        total: number;
        currency: string;
    }>;
    getSubscriptionStats(): Promise<{
        byPlan: {
            planName: string;
            planId: number;
            activeSubscriptions: number;
        }[];
        total: number;
    }>;
}
