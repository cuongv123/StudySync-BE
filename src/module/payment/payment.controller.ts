import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  BadRequestException,
  Logger,
  Req,
  Res,
  HttpStatus,
  RawBodyRequest,
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
import { Public } from '../../decorator/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint for UptimeRobot monitoring' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'payment',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

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
      // Debug logging
      this.logger.log('=== Purchase Request ===');
      this.logger.log('req.user:', JSON.stringify(req.user));
      this.logger.log('purchaseDto:', JSON.stringify(purchaseDto));

      // Validate userId - use req.user.id OR req.user.userId OR req.user.sub
      const userId = req.user?.id || req.user?.userId || req.user?.sub;
      
      if (!userId) {
        throw new BadRequestException('User not authenticated. Please login again.');
      }

      // Lấy thông tin user từ JWT token hoặc từ DTO (nếu user cung cấp)
      const paymentData = await this.paymentService.createSubscriptionPayment(
        userId,
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
      this.logger.error('Purchase error:', error.message);
      throw new BadRequestException(error.message);
    }
  }

    @Post('webhook')
  @ApiOperation({ summary: 'PayOS webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handlePayOSWebhook(@Req() req: any, @Res() res: any) {
    const body = req.body || {};

    // Body rỗng: test endpoint -> trả 200, không xử lý
    if (Object.keys(body).length === 0) {
      return res.status(200).json({ success: true, message: 'Webhook OK' });
    }

    // 1) Xác thực chữ ký. Sai/thiếu -> từ chối.
    let verifiedData;
    try {
      verifiedData = await this.paymentService.verifyWebhook(body);
    } catch (error: any) {
      this.logger.warn(`Webhook rejected - invalid signature: ${error.message}`);
      return res.status(401).json({ success: false, error: 'Invalid signature' });
    }

    // 2) Xử lý bằng dữ liệu ĐÃ XÁC THỰC (không dùng body thô)
    try {
      const result = await this.paymentService.handlePaymentWebhook(verifiedData);
      this.logger.log(`Webhook handled: order=${verifiedData.orderCode}, ${result.message}`);
      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      // Lỗi bất ngờ -> 500 để PayOS gửi lại (transaction đã rollback nên an toàn)
      this.logger.error(`Webhook processing failed for order ${verifiedData.orderCode}: ${error.message}`);
      return res.status(500).json({ success: false, error: 'Webhook processing failed' });
    }
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiResponse({ status: 200, description: 'Returns user payment history' })
  async getPaymentHistory(@Request() req) {
    return {
      data: await this.paymentService.getUserPayments(req.user?.id || req.user?.userId),
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('detail')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment details by order code (from database only)' })
  @ApiResponse({ status: 200, description: 'Returns payment details from database' })
  async getPaymentByOrderCode(@Request() req, @Query('orderCode') orderCode: string) {
    return {
      data: await this.paymentService.getPaymentByOrderCode(orderCode),
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('success/:orderCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment info for success page from database' })
  @ApiResponse({ status: 200, description: 'Returns payment info for success page' })
  async getPaymentSuccessInfo(@Request() req, @Param('orderCode') orderCode: string) {
    try {
      // Only query database, don't call PayOS (payment link already deleted after success)
      const payment = await this.paymentService.getPaymentByOrderCode(orderCode);
      
      // Format response for frontend
      return {
        data: {
          orderCode: payment.orderCode,
          planName: payment.plan?.planName,
          amount: payment.amount,
          status: payment.status,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
          paymentMethod: payment.paymentMethod,
        },
        statusCode: 200,
        message: 'Payment information retrieved successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('Get payment success info error:', error.message);
      throw new BadRequestException(error.message || 'Không tìm thấy thông tin thanh toán');
    }
  }

  @Get('transaction/:orderCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get transaction details from PayOS ',
    description: 'This endpoint calls PayOS API. Use /payments/success/:orderCode for payment success page instead.'
  })
  @ApiResponse({ status: 200, description: 'Returns full transaction info from PayOS gateway' })
  async getTransactionDetails(@Request() req, @Param('orderCode') orderCode: string) {
    try {
      const transactionInfo = await this.paymentService.getPayOSTransactionInfo(orderCode);
      
      return {
        data: transactionInfo,
        statusCode: 200,
        message: 'Transaction details retrieved successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('Get transaction error:', error.message);
      throw new BadRequestException(error.message);
    }
  }

  @Post('cancel/:orderCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel a pending payment' })
  @ApiResponse({ status: 200, description: 'Payment cancelled successfully' })
  async cancelPayment(@Request() req, @Param('orderCode') orderCode: string) {
    try {
      const userId = req.user?.id || req.user?.userId || req.user?.sub;
      await this.paymentService.cancelPayment(userId, orderCode);
      
      return {
        statusCode: 200,
        message: 'Payment cancelled successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      this.logger.error('Cancel payment error:', error.message);
      throw new BadRequestException(error.message);
    }
  }
}
