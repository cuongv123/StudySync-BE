import { SubscriptionService } from './subscription.service';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getPlans(): Promise<{
        data: import("./entities/subscription-plan.entity").SubscriptionPlan[];
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getCurrentSubscription(req: any): Promise<{
        data: import("./entities/user-subscription.entity").UserSubscription | {
            id: number;
            userId: string;
            planId: number;
            plan: import("./entities/subscription-plan.entity").SubscriptionPlan;
            startDate: Date;
            endDate: any;
            isActive: boolean;
            autoRenew: boolean;
            status: import("./entities/user-subscription.entity").SubscriptionStatus;
            purchasedFromWallet: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
}
