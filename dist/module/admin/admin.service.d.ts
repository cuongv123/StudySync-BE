import { Repository } from 'typeorm';
import { UsersService } from '../User/User.service';
import { ReviewService } from '../review/review.service';
import { SubscriptionPayment } from '../subscription/entities/subscription-payment.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { Role } from '../../common/enums/role.enum';
export declare class AdminService {
    private readonly usersService;
    private readonly reviewService;
    private readonly paymentRepository;
    private readonly userSubscriptionRepository;
    private readonly planRepository;
    constructor(usersService: UsersService, reviewService: ReviewService, paymentRepository: Repository<SubscriptionPayment>, userSubscriptionRepository: Repository<UserSubscription>, planRepository: Repository<SubscriptionPlan>);
    getAdminProfile(adminId: string): Promise<import("../User/entities/User.entity").User>;
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
    listUsers(adminId: string, query: any): Promise<import("../User/entities/User.entity").User[]>;
    getUserById(id: string): Promise<import("../User/entities/User.entity").User>;
    resetUserPassword(id: string, newPassword: string): Promise<{
        message: string;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    assignRole(userId: string, role: Role): Promise<{
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
