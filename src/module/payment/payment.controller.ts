import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { WalletService } from './services/wallet.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { SubscriptionService } from './services/subscription.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpgradeSubscriptionDto, PaginationDto } from './dto/subscription.dto';
import {
  PaymentResponseDto,
  WalletBalanceDto,
  TransactionHistoryDto,
} from './dto/payment-response.dto';
import { PaymentMethod } from './entities/payment.entity';

@ApiTags('Payment & Subscription')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // ===== WALLET ENDPOINTS =====
  
  @Get('wallet/balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ 
    status: 200, 
    description: 'Balance retrieved successfully',
    type: WalletBalanceDto 
  })
  async getWalletBalance(@Request() req): Promise<WalletBalanceDto> {
    const userId = req.user.id;
    const balance = await this.walletService.getBalance(userId);
    const wallet = await this.walletService.getOrCreateWallet(userId);
    
    return {
      userId,
      balance,
      currency: wallet.currency,
      updatedAt: wallet.updatedAt,
    };
  }

  @Get('wallet/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ 
    status: 200, 
    description: 'Transactions retrieved successfully',
    type: TransactionHistoryDto 
  })
  async getTransactionHistory(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<TransactionHistoryDto> {
    const userId = req.user.id;
    const result = await this.walletService.getTransactionHistory(userId, page, limit);
    
    return {
      transactions: result.transactions,
      total: result.total,
      page,
      limit,
    };
  }

  // ===== PAYMENT ENDPOINTS =====

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payment for wallet deposit' })
  @ApiResponse({ 
    status: 201, 
    description: 'Payment created successfully',
    type: PaymentResponseDto 
  })
  async createPayment(
    @Request() req,
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const userId = req.user.id;
    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await this.paymentGatewayService.createPayment(
      createPaymentDto,
      userId,
      ipAddress,
      userAgent,
    );

    return {
      paymentUrl: result.paymentUrl,
      transactionId: result.transactionId,
      amount: result.amount,
      gateway: result.paymentMethod,
      expiresAt: result.expiresAt,
    };
  }

  @Get('transaction/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment details by transaction ID' })
  @ApiResponse({ status: 200, description: 'Payment details retrieved' })
  async getPaymentDetails(@Param('transactionId') transactionId: string) {
    return this.paymentGatewayService.getPaymentStatus(transactionId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPaymentHistory(
    @Request() req,
    @Query() pagination: PaginationDto,
  ) {
    const userId = req.user.id;
    const limit = pagination.limit || 10;
    const offset = ((pagination.page || 1) - 1) * limit;
    return this.paymentGatewayService.getUserPayments(userId, limit, offset);
  }

  // ===== SUBSCRIPTION ENDPOINTS =====

  @Get('subscriptions/plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  async getSubscriptionPlans() {
    return this.subscriptionService.getAllPlans();
  }

  @Get('subscriptions/current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({ status: 200, description: 'Current subscription retrieved' })
  async getCurrentSubscription(@Request() req) {
    const userId = req.user.id;
    return this.subscriptionService.getUserSubscription(userId);
  }

  @Get('subscriptions/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get subscription statistics and usage' })
  @ApiResponse({ status: 200, description: 'Subscription stats retrieved' })
  async getSubscriptionStats(@Request() req) {
    return this.subscriptionService.getSubscriptionStats();
  }

  @Post('subscriptions/upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upgrade subscription using wallet balance' })
  @ApiResponse({ status: 200, description: 'Subscription upgraded successfully' })
  async upgradeSubscription(
    @Request() req,
    @Body() upgradeDto: UpgradeSubscriptionDto,
  ) {
    const userId = req.user.id;
    return this.subscriptionService.upgradeWithWallet(userId, upgradeDto.planId);
  }

  // ===== GATEWAY CALLBACK ENDPOINTS =====

  @Post('vnpay/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'VNPay payment callback' })
  @ApiResponse({ status: 200, description: 'Callback processed' })
  async handleVNPayCallback(@Body() callbackData: any, @Request() req) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.paymentGatewayService.handlePaymentCallback(PaymentMethod.VNPAY, callbackData, ipAddress);
  }

  @Post('momo/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'MoMo payment callback' })
  @ApiResponse({ status: 200, description: 'Callback processed' })
  async handleMoMoCallback(@Body() callbackData: any, @Request() req) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.paymentGatewayService.handlePaymentCallback(PaymentMethod.MOMO, callbackData, ipAddress);
  }

  @Post('zalopay/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ZaloPay payment callback' })
  @ApiResponse({ status: 200, description: 'Callback processed' })
  async handleZaloPayCallback(@Body() callbackData: any, @Request() req) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    return this.paymentGatewayService.handlePaymentCallback(PaymentMethod.ZALOPAY, callbackData, ipAddress);
  }

  // ===== HEALTH CHECK =====

  @Get('health')
  @ApiOperation({ summary: 'Payment service health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'OK',
      message: 'Payment service is running',
      timestamp: new Date().toISOString(),
      services: {
        wallet: 'active',
        vnpay: 'configured',
        momo: 'configured',
        zalopay: 'configured',
        subscription: 'active',
      },
    };
  }
}