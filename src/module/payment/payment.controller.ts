import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  Logger,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { PaymentService } from './payment.service';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { Request as ExpressRequest, Response } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Purchase subscription with PayOS' })
  @ApiResponse({ status: 200, description: 'Returns PayOS checkout URL with QR code' })
  async purchaseSubscription(
    @Request() req,
    @Body() purchaseDto: PurchaseSubscriptionDto
  ) {
    try {
      // Lấy thông tin user từ JWT token hoặc từ DTO (nếu user cung cấp)
      const paymentData = await this.paymentService.createSubscriptionPayment(
        req.user.sub,
        purchaseDto.planId,
        {
          name: purchaseDto.name || req.user.username || req.user.email?.split('@')[0] || 'User',
          email: purchaseDto.email || req.user.email || 'user@studysync.com',
          phone: purchaseDto.phone || req.user.phone || '0000000000',
        }
      );

      return {
        data: paymentData,
        statusCode: 200,
        message: 'Payment link created successfully. Please scan QR code to pay.',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('webhook-test')
  @ApiOperation({ summary: 'Test webhook endpoint health' })
  async testWebhook() {
    this.logger.log('✅ Webhook test endpoint called');
    return { 
      status: 'ok',
      message: 'Webhook endpoint is reachable',
      timestamp: new Date().toISOString()
    };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'PayOS webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handlePayOSWebhook(@Req() req: ExpressRequest, @Res() res: Response) {
    try {
      this.logger.log('=== PayOS Webhook Received ===');
      this.logger.log('Headers:', JSON.stringify(req.headers));
      this.logger.log('Body:', JSON.stringify(req.body));
      
      const webhookData = req.body;

      // Always return 200 OK for PayOS webhook test
      if (!webhookData || Object.keys(webhookData).length === 0) {
        this.logger.log('✅ Empty webhook - Test from PayOS');
        return res.status(HttpStatus.OK).json({ success: true });
      }

      // Process webhook
      const result = await this.paymentService.handlePaymentWebhook(webhookData);
      this.logger.log('✅ Webhook processed successfully');
      
      return res.status(HttpStatus.OK).json({ success: true, data: result });
    } catch (error: any) {
      this.logger.error('❌ Webhook error:', error.message);
      this.logger.error('Stack:', error.stack);
      // Return 200 to prevent PayOS retry
      return res.status(HttpStatus.OK).json({ success: false, error: error.message });
    }
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiResponse({ status: 200, description: 'Returns user payment history' })
  async getPaymentHistory(@Request() req) {
    return {
      data: await this.paymentService.getUserPayments(req.user.sub),
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('detail')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment details by order code' })
  @ApiResponse({ status: 200, description: 'Returns payment details' })
  async getPaymentByOrderCode(@Request() req, @Query('orderCode') orderCode: string) {
    return {
      data: await this.paymentService.getPaymentByOrderCode(orderCode),
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }
}
