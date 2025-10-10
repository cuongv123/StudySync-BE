import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

export interface ZaloPayConfig {
  appId: string;
  key1: string;
  key2: string;
  endpoint: string;
  callbackUrl: string;
}

export interface CreateZaloPayPaymentDto {
  amount: number;
  description: string;
  embedData?: string;
  itemData?: string;
}

export interface ZaloPayPaymentResponse {
  returnCode: number;
  returnMessage: string;
  subReturnCode: number;
  subReturnMessage: string;
  zptranstoken?: string;
  orderUrl?: string;
  orderId: string;
  appTransId: string;
}

@Injectable()
export class ZaloPayService {
  private readonly logger = new Logger(ZaloPayService.name);
  private readonly config: ZaloPayConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      appId: this.configService.get<string>('ZALOPAY_APP_ID'),
      key1: this.configService.get<string>('ZALOPAY_KEY1'),
      key2: this.configService.get<string>('ZALOPAY_KEY2'),
      endpoint: this.configService.get<string>('ZALOPAY_ENDPOINT'),
      callbackUrl: this.configService.get<string>('ZALOPAY_CALLBACK_URL'),
    };

    this.validateConfig();
  }

  /**
   * Validate ZaloPay configuration
   */
  private validateConfig(): void {
    const missingConfigs: string[] = [];

    if (!this.config.appId) missingConfigs.push('ZALOPAY_APP_ID');
    if (!this.config.key1) missingConfigs.push('ZALOPAY_KEY1');
    if (!this.config.key2) missingConfigs.push('ZALOPAY_KEY2');
    if (!this.config.endpoint) missingConfigs.push('ZALOPAY_ENDPOINT');
    if (!this.config.callbackUrl) missingConfigs.push('ZALOPAY_CALLBACK_URL');

    if (missingConfigs.length > 0) {
      this.logger.error(`Missing ZaloPay configurations: ${missingConfigs.join(', ')}`);
      throw new Error(`Missing ZaloPay configurations: ${missingConfigs.join(', ')}`);
    }

    this.logger.log('ZaloPay configuration validated successfully');
  }

  /**
   * Create ZaloPay payment order
   */
  async createPaymentUrl(
    transactionId: string,
    paymentData: CreateZaloPayPaymentDto,
  ): Promise<string> {
    try {
      const appTransId = this.generateAppTransId(transactionId);
      const embedData = JSON.stringify({
        merchantinfo: 'StudySync Payment',
        redirecturl: this.config.callbackUrl,
      });

      const order = {
        app_id: this.config.appId,
        app_trans_id: appTransId,
        app_user: 'studysync_user',
        app_time: Date.now(),
        item: JSON.stringify([{
          name: paymentData.description || 'StudySync Payment',
          quantity: 1,
          price: paymentData.amount,
        }]),
        embed_data: embedData,
        amount: paymentData.amount,
        description: paymentData.description || `StudySync Payment - ${transactionId}`,
        bank_code: '',
        callback_url: this.config.callbackUrl,
      };

      // Generate MAC signature
      const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
      order['mac'] = crypto
        .createHmac('sha256', this.config.key1)
        .update(data)
        .digest('hex');

      this.logger.log(`Creating ZaloPay payment for transaction: ${transactionId}`);

      // Make API call to ZaloPay
      const response = await axios.post(this.config.endpoint, order, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const result: ZaloPayPaymentResponse = response.data;

      if (result.returnCode !== 1) {
        this.logger.error(`ZaloPay API error: ${result.returnMessage} (${result.returnCode})`);
        throw new BadRequestException(`ZaloPay payment creation failed: ${result.returnMessage}`);
      }

      this.logger.log(`ZaloPay payment URL created successfully for transaction: ${transactionId}`);
      return result.orderUrl;

    } catch (error) {
      this.logger.error(`Failed to create ZaloPay payment: ${(error as Error)?.message || error}`, (error as Error)?.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      if ((error as any)?.response) {
        this.logger.error(`ZaloPay API Response: ${JSON.stringify((error as any).response.data)}`);
        throw new BadRequestException('ZaloPay service is temporarily unavailable');
      }
      
      throw new BadRequestException('Failed to create ZaloPay payment');
    }
  }

  /**
   * Verify ZaloPay callback signature
   */
  verifyCallback(callbackData: any): { isValid: boolean; transactionId: string } {
    try {
      const { data, mac } = callbackData;
      
      if (!data || !mac) {
        this.logger.warn('ZaloPay callback missing data or mac');
        return { isValid: false, transactionId: null };
      }

      // Verify MAC signature
      const expectedMac = crypto
        .createHmac('sha256', this.config.key2)
        .update(data)
        .digest('hex');

      const isValid = mac === expectedMac;
      
      if (!isValid) {
        this.logger.warn('ZaloPay callback signature verification failed');
        return { isValid: false, transactionId: null };
      }

      // Parse data to get transaction info
      const dataObj = JSON.parse(data);
      const appTransId = dataObj.app_trans_id;
      const transactionId = this.extractTransactionId(appTransId);

      this.logger.log(`ZaloPay callback verified successfully for transaction: ${transactionId}`);
      
      return { 
        isValid: true, 
        transactionId: transactionId || appTransId 
      };

    } catch (error) {
      this.logger.error(`Failed to verify ZaloPay callback: ${(error as Error)?.message || error}`, (error as Error)?.stack);
      return { isValid: false, transactionId: null };
    }
  }

  /**
   * Generate app_trans_id for ZaloPay
   */
  private generateAppTransId(transactionId: string): string {
    const today = new Date();
    const yymmdd = today.getFullYear().toString().substr(-2) +
                  String(today.getMonth() + 1).padStart(2, '0') +
                  String(today.getDate()).padStart(2, '0');
    
    return `${yymmdd}_${transactionId}`;
  }

  /**
   * Extract transaction ID from app_trans_id
   */
  private extractTransactionId(appTransId: string): string {
    const parts = appTransId.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : appTransId;
  }

  /**
   * Get ZaloPay configuration for testing
   */
  getConfig(): Partial<ZaloPayConfig> {
    return {
      appId: this.config.appId,
      endpoint: this.config.endpoint,
      callbackUrl: this.config.callbackUrl,
    };
  }
}