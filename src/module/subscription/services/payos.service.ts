import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';

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

export interface PayOSWebhookData {
  orderCode: number;
  amount: number;
  description: string;
  accountNumber: string;
  reference: string;
  transactionDateTime: string;
  currency: string;
  paymentLinkId: string;
  code: string;
  desc: string;
  [key: string]: any;
}

@Injectable()
export class PayOSService {
  private readonly logger = new Logger(PayOSService.name);
  private readonly payOS: any;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('CLIENT_ID');
    const apiKey = this.configService.get<string>('API_KEY');
    const checksumKey = this.configService.get<string>('CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      throw new Error('PayOS credentials are missing in environment variables');
    }

    this.payOS = new PayOS({
      clientId,
      apiKey,
      checksumKey,
    });
    this.logger.log('PayOS Service initialized successfully');
  }

  /**
   * Tạo payment link với QR code
   */
  async createPaymentLink(data: CreatePaymentLinkDto) {
    try {
      const paymentData = {
        orderCode: Number(data.orderCode),
        amount: Number(data.amount),
        description: data.description,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone,
        buyerAddress: data.buyerAddress || 'N/A',
        items: data.items,
        returnUrl: data.returnUrl || `${this.configService.get('APP_URL')}/subscription/success`,
        cancelUrl: data.cancelUrl || `${this.configService.get('APP_URL')}/subscription/cancel`,
        expiredAt: Math.floor(Date.now() / 1000) + 15 * 60, // Expire sau 15 phút
      };

      this.logger.log(`Creating payment link for order: ${data.orderCode}`);
      this.logger.log(`Payment data: ${JSON.stringify(paymentData, null, 2)}`);
      
      const response = await this.payOS.paymentRequests.create(paymentData);
      
      this.logger.log(`Payment link created successfully: ${response.checkoutUrl}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to create payment link: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create payment link: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin payment
   */
  async getPaymentInfo(orderCode: string) {
    try {
      const response = await this.payOS.paymentRequests.get(Number(orderCode));
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to get payment info: ${error.message}`);
      throw new BadRequestException(`Failed to get payment info: ${error.message}`);
    }
  }

  /**
   * Cancel payment link
   */
  async cancelPaymentLink(orderCode: string, reason?: string) {
    try {
      const response = await this.payOS.paymentRequests.cancel(Number(orderCode), reason);
      this.logger.log(`Payment link cancelled: ${orderCode}`);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to cancel payment: ${error.message}`);
      throw new BadRequestException(`Failed to cancel payment: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * PayOS SDK tự động verify signature dựa vào CHECKSUM_KEY
   */
    async verifyWebhook(webhookBody: any): Promise<PayOSWebhookData> {
    // Hợp lệ -> trả về data đã xác thực. Sai/thiếu chữ ký -> throw.
    return this.payOS.webhooks.verify(webhookBody);
  }
}
