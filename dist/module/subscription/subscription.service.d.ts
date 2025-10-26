import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserSubscription, SubscriptionStatus } from './entities/user-subscription.entity';
import { SubscriptionPayment } from './entities/subscription-payment.entity';
import { PayOSService } from './services/payos.service';
export declare class SubscriptionService {
    private readonly planRepository;
    private readonly subscriptionRepository;
    private readonly paymentRepository;
    private readonly payosService;
    private readonly configService;
    private readonly logger;
    constructor(planRepository: Repository<SubscriptionPlan>, subscriptionRepository: Repository<UserSubscription>, paymentRepository: Repository<SubscriptionPayment>, payosService: PayOSService, configService: ConfigService);
    getAllPlans(): Promise<SubscriptionPlan[]>;
    getPlanById(planId: number): Promise<SubscriptionPlan>;
    getUserSubscription(userId: string): Promise<UserSubscription | {
        id: number;
        userId: string;
        planId: number;
        plan: SubscriptionPlan;
        startDate: Date;
        endDate: any;
        isActive: boolean;
        autoRenew: boolean;
        status: SubscriptionStatus;
        purchasedFromWallet: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createSubscriptionPayment(userId: string, planId: number, userInfo: {
        name?: string;
        email?: string;
        phone?: string;
    }): Promise<{
        orderCode: string;
        checkoutUrl: any;
        qrCode: any;
        amount: number;
        planName: string;
    }>;
    handlePaymentWebhook(webhookData: any): Promise<{
        message: string;
    }>;
    private activateSubscription;
    getUserPayments(userId: string): Promise<SubscriptionPayment[]>;
    getPaymentByOrderCode(orderCode: string): Promise<SubscriptionPayment>;
}
