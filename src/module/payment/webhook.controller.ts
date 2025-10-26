import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('payos')
  @ApiOperation({ summary: 'PayOS webhook endpoint - No validation' })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  async handlePayOSWebhook(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    try {
      this.logger.log('=== PayOS Webhook Received ===');
      this.logger.log('Headers:', JSON.stringify(req.headers, null, 2));
      this.logger.log('Body:', JSON.stringify(req.body, null, 2));

      const webhookData = req.body;

      // Test webhook - empty body
      if (!webhookData || Object.keys(webhookData).length === 0) {
        this.logger.log('✅ Test webhook from PayOS - Empty body');
        res.status(HttpStatus.OK).json({
          success: true,
          message: 'Webhook endpoint is working',
        });
        return;
      }

      // Process real webhook
      const result = await this.paymentService.handlePaymentWebhook(webhookData);
      this.logger.log('✅ Webhook processed successfully:', result);

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      this.logger.error('❌ Webhook processing error:', error.message);
      this.logger.error('Stack trace:', error.stack);

      // Always return 200 to prevent PayOS from retrying
      res.status(HttpStatus.OK).json({
        success: false,
        error: error.message,
      });
    }
  }
}
