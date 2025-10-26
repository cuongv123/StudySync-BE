import { Repository } from 'typeorm';
import { SubscriptionPayment } from '../subscription/entities/subscription-payment.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { PayOSService } from '../subscription/services/payos.service';
import { ConfigService } from '@nestjs/config';
export declare class PaymentService {
    private readonly paymentRepository;
    private readonly planRepository;
    private readonly subscriptionRepository;
    private readonly payosService;
    private readonly configService;
    private readonly logger;
    constructor(paymentRepository: Repository<SubscriptionPayment>, planRepository: Repository<SubscriptionPlan>, subscriptionRepository: Repository<UserSubscription>, payosService: PayOSService, configService: ConfigService);
    createSubscriptionPayment(userId: string, planId: number, userInfo: {
        name?: string;
        email?: string;
        phone?: string;
    }): Promise<{
        orderCode: number;
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
    getPayOSTransactionInfo(orderCode: string): Promise<{
        orderCode: any;
        amount: any;
        description: any;
        status: any;
        currency: any;
        paymentLinkId: any;
        checkoutUrl: any;
        qrCode: any;
        transactions: any;
        paymentRecord: {
            id: number;
            userId: string;
            planId: number;
            planName: string;
            status: string;
            paidAt: Date;
            createdAt: Date;
        };
    }>;
    verifyWebhookSignature(webhookData: any): Promise<boolean>;
}
