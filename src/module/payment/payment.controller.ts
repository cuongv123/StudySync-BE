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

  @Post('webhook')
  @ApiOperation({ summary: 'PayOS webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handlePayOSWebhook(@Body() webhookData: any, @Request() req) {
    try {
      this.logger.log('Received webhook request', JSON.stringify(webhookData));

      // Check if this is a test request from PayOS (empty body or test data)
      if (!webhookData || Object.keys(webhookData).length === 0) {
        this.logger.log('Received test webhook from PayOS');
        return {
          success: true,
          message: 'Webhook endpoint is working',
          timestamp: new Date().toISOString(),
        };
      }

      // Verify webhook signature để đảm bảo request từ PayOS
      // TODO: Enable in production
      // const isValid = await this.paymentService.verifyWebhookSignature(webhookData);
      // if (!isValid) {
      //   this.logger.warn('Invalid webhook signature detected');
      //   throw new BadRequestException('Invalid webhook signature');
      // }

      const result = await this.paymentService.handlePaymentWebhook(webhookData);
      return {
        data: result,
        statusCode: 200,
        message: 'Webhook processed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('Webhook error:', error.message);
      throw new BadRequestException(error.message);
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
