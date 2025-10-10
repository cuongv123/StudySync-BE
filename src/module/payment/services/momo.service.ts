import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

export interface MoMoConfig {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
  endpoint: string;
  redirectUrl: string;
  ipnUrl: string;
}

export interface CreateMoMoPaymentDto {
  amount: number;
  orderInfo: string;
  extraData?: string;
  requestType?: string;
  lang?: string;
}

export interface MoMoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  signature: string;
}

@Injectable()
export class MoMoService {
  private readonly logger = new Logger(MoMoService.name);
  private readonly config: MoMoConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      partnerCode: this.configService.get<string>('MOMO_PARTNER_CODE'),
      accessKey: this.configService.get<string>('MOMO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MOMO_SECRET_KEY'),
      endpoint: this.configService.get<string>('MOMO_ENDPOINT'),
      redirectUrl: this.configService.get<string>('MOMO_REDIRECT_URL'),
      ipnUrl: this.configService.get<string>('MOMO_IPN_URL'),
    };

    this.validateConfig();
  }

  /**
   * Create MoMo payment
   */
  async createPayment(
    orderId: string,
    paymentData: CreateMoMoPaymentDto,
  ): Promise<MoMoPaymentResponse> {
    try {
      const requestId = this.generateRequestId();
      const timeoutSeconds = this.configService.get('MOMO_TIMEOUT_SECONDS', 30);
      
      const rawSignature = [
        'accessKey=' + this.config.accessKey,
        'amount=' + paymentData.amount,
        'extraData=' + (paymentData.extraData || ''),
        'ipnUrl=' + this.config.ipnUrl,
        'orderId=' + orderId,
        'orderInfo=' + paymentData.orderInfo,
        'partnerCode=' + this.config.partnerCode,
        'redirectUrl=' + this.config.redirectUrl,
        'requestId=' + requestId,
        'requestType=' + (paymentData.requestType || 'captureWallet'),
      ].join('&');

      const signature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(rawSignature)
        .digest('hex');

      const requestBody = {
        partnerCode: this.config.partnerCode,
        partnerName: 'StudySync',
        storeId: 'StudySyncStore',
        requestId,
        amount: paymentData.amount,
        orderId,
        orderInfo: paymentData.orderInfo,
        redirectUrl: this.config.redirectUrl,
        ipnUrl: this.config.ipnUrl,
        lang: paymentData.lang || 'vi',
        extraData: paymentData.extraData || '',
        requestType: paymentData.requestType || 'captureWallet',
        signature,
      };

      const response = await axios.post(
        `${this.config.endpoint}/v2/create`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: timeoutSeconds * 1000,
        },
      );

      const result: MoMoPaymentResponse = response.data;

      if (result.resultCode === 0) {
        this.logger.log(`MoMo payment created successfully for order: ${orderId}`);
        return result;
      }

      throw new BadRequestException(`MoMo payment failed: ${result.message}`);
    } catch (error) {
      this.logger.error(`Error creating MoMo payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new BadRequestException('Failed to create MoMo payment');
    }
  }

  /**
   * Verify MoMo callback signature
   */
  verifyCallback(callbackData: any): { isValid: boolean; message: string } {
    try {
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
      } = callbackData;

      const rawSignature = [
        'accessKey=' + this.config.accessKey,
        'amount=' + amount,
        'extraData=' + (extraData || ''),
        'message=' + message,
        'orderId=' + orderId,
        'orderInfo=' + orderInfo,
        'orderType=' + orderType,
        'partnerCode=' + partnerCode,
        'payType=' + payType,
        'requestId=' + requestId,
        'responseTime=' + responseTime,
        'resultCode=' + resultCode,
        'transId=' + transId,
      ].join('&');

      const expectedSignature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(rawSignature)
        .digest('hex');

      if (signature === expectedSignature) {
        return { isValid: true, message: 'Signature valid' };
      }

      return { isValid: false, message: 'Invalid signature' };
    } catch (error) {
      this.logger.error(`MoMo callback verification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, message: 'Verification failed' };
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `MOMO${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  /**
   * Validate MoMo configuration
   */
  private validateConfig(): void {
    if (!this.config.partnerCode || !this.config.secretKey || !this.config.endpoint) {
      throw new Error('MoMo configuration is incomplete. Please check MOMO_* environment variables.');
    }
  }
}