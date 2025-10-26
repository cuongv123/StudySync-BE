import { PaymentService } from './payment.service';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
export declare class PaymentController {
    private readonly paymentService;
    private readonly logger;
    constructor(paymentService: PaymentService);
    purchaseSubscription(req: any, purchaseDto: PurchaseSubscriptionDto): Promise<{
        data: {
            orderCode: string;
            checkoutUrl: any;
            qrCode: any;
            amount: number;
            planName: string;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    handlePayOSWebhook(req: any, res: any): Promise<any>;
    getPaymentHistory(req: any): Promise<{
        data: import("../subscription/entities/subscription-payment.entity").SubscriptionPayment[];
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getPaymentByOrderCode(req: any, orderCode: string): Promise<{
        data: import("../subscription/entities/subscription-payment.entity").SubscriptionPayment;
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
}
