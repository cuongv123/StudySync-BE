import { User } from '../../User/entities/User.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    CANCELLED = "cancelled",
    EXPIRED = "expired"
}
export declare enum PaymentMethod {
    PAYOS = "PAYOS"
}
export declare class SubscriptionPayment {
    id: number;
    userId: string;
    planId: number;
    orderCode: string;
    amount: number;
    status: string;
    paymentMethod: string;
    payosTransactionId?: string;
    checkoutUrl: string;
    payosResponse: string;
    paidAt: Date;
    expiredAt: Date;
    walletId: number;
    callbackData: any;
    user: User;
    plan: SubscriptionPlan;
    createdAt: Date;
    updatedAt: Date;
}
