import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as qs from 'querystring';

export interface VNPayConfig {
  tmnCode: string;
  hashSecret: string;
  url: string;
  returnUrl: string;
  ipnUrl: string;
}

export interface CreateVNPayPaymentDto {
  amount: number;
  orderInfo: string;
  orderType: string;
  ipAddress: string;
  locale?: string;
  currCode?: string;
}

@Injectable()
export class VNPayService {
  private readonly logger = new Logger(VNPayService.name);
  private readonly config: VNPayConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      tmnCode: this.configService.get<string>('VNPAY_TMN_CODE'),
      hashSecret: this.configService.get<string>('VNPAY_HASH_SECRET'),
      url: this.configService.get<string>('VNPAY_URL'),
      returnUrl: this.configService.get<string>('VNPAY_RETURN_URL'),
      ipnUrl: this.configService.get<string>('VNPAY_IPN_URL'),
    };

    this.validateConfig();
  }

  /**
   * Create VNPay payment URL
   */
  async createPaymentUrl(
    transactionId: string,
    paymentData: CreateVNPayPaymentDto,
  ): Promise<string> {
    try {
      const timeoutMinutes = this.configService.get('VNPAY_TIMEOUT_MINUTES', 15);
      
      const vnpParams: Record<string, string> = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.config.tmnCode,
        vnp_Amount: (paymentData.amount * 100).toString(),
        vnp_CurrCode: paymentData.currCode || 'VND',
        vnp_TxnRef: transactionId,
        vnp_OrderInfo: paymentData.orderInfo,
        vnp_OrderType: paymentData.orderType,
        vnp_Locale: paymentData.locale || 'vn',
        vnp_ReturnUrl: this.config.returnUrl,
        vnp_IpAddr: paymentData.ipAddress,
        vnp_CreateDate: this.formatDate(new Date()),
        vnp_ExpireDate: this.formatDate(new Date(Date.now() + timeoutMinutes * 60 * 1000)),
      };

      // Sort parameters
      const sortedParams = this.sortObject(vnpParams);
      
      // Create query string
      const signData = qs.stringify(sortedParams);
      
      // Create secure hash
      const hmac = crypto.createHmac('sha512', this.config.hashSecret);
      const signed = hmac.update(signData, 'utf-8').digest('hex');
      
      vnpParams['vnp_SecureHash'] = signed;

      const finalUrl = this.config.url + '?' + qs.stringify(vnpParams);
      
      this.logger.log(`VNPay payment URL created for transaction: ${transactionId}`);
      return finalUrl;
    } catch (error) {
      this.logger.error(`Error creating VNPay URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new BadRequestException('Failed to create VNPay payment URL');
    }
  }

  /**
   * Verify VNPay callback
   */
  verifyCallback(callbackData: any): { isValid: boolean; message: string } {
    try {
      const secureHash = callbackData['vnp_SecureHash'];
      delete callbackData['vnp_SecureHash'];
      delete callbackData['vnp_SecureHashType'];

      const sortedParams = this.sortObject(callbackData);
      const signData = qs.stringify(sortedParams);
      
      const hmac = crypto.createHmac('sha512', this.config.hashSecret);
      const signed = hmac.update(signData, 'utf-8').digest('hex');

      if (secureHash === signed) {
        return { isValid: true, message: 'Signature valid' };
      }
      
      return { isValid: false, message: 'Invalid signature' };
    } catch (error) {
      this.logger.error(`VNPay callback verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, message: 'Verification failed' };
    }
  }

  /**
   * Sort object parameters
   */
  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }

  /**
   * Format date for VNPay
   */
  private formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, '').replace('T', '');
  }

  /**
   * Validate VNPay configuration
   */
  private validateConfig(): void {
    if (!this.config.tmnCode || !this.config.hashSecret || !this.config.url) {
      throw new Error('VNPay configuration is incomplete. Please check VNPAY_* environment variables.');
    }
  }

  /**
   * Generate unique transaction reference
   */
  generateTransactionRef(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `VNP${timestamp}${random}`;
  }
}