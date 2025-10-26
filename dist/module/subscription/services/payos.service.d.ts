import { ConfigService } from '@nestjs/config';
export interface PaymentItem {
    name: string;
    quantity: number;
    price: number;
}
export interface CreatePaymentLinkDto {
    orderCode: string;
    amount: number;
    description: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerAddress?: string;
    buyerCompanyName?: string;
    buyerTaxCode?: string;
    items: PaymentItem[];
    returnUrl?: string;
    cancelUrl?: string;
}
export declare class PayOSService {
    private configService;
    private readonly logger;
    private readonly payOS;
    constructor(configService: ConfigService);
    createPaymentLink(data: CreatePaymentLinkDto): Promise<any>;
    getPaymentInfo(orderCode: string): Promise<any>;
    cancelPaymentLink(orderCode: string, reason?: string): Promise<any>;
    verifyWebhookSignature(webhookData: any): boolean;
}
