import { PaymentService } from './payment.service';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
export declare class PaymentController {
    private readonly paymentService;
    private readonly logger;
    constructor(paymentService: PaymentService);
    purchaseSubscription(req: any, purchaseDto: PurchaseSubscriptionDto): Promise<{
        data: {
            orderCode: number;
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
    getPaymentSuccessInfo(req: any, orderCode: string): Promise<{
        data: {
            orderCode: string;
            planName: string;
            amount: number;
            status: string;
            paidAt: Date;
            createdAt: Date;
            paymentMethod: string;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getTransactionDetails(req: any, orderCode: string): Promise<{
        data: {
            orderCode: string;
            amount: number;
            status: string;
            message: string;
            paymentRecord: {
                id: number;
                userId: string;
                planId: number;
                planName: string;
                status: string;
                paidAt: Date;
                createdAt: Date;
            };
            description?: undefined;
            currency?: undefined;
            paymentLinkId?: undefined;
            checkoutUrl?: undefined;
            qrCode?: undefined;
            transactions?: undefined;
        } | {
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
            message?: undefined;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    cancelPayment(req: any, orderCode: string): Promise<{
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
}
