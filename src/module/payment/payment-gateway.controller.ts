// src/payment/payment-gateway.controller.ts

import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Request,
  HttpCode, 
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@Controller('payments')
export class PaymentGatewayController {
  constructor(
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  // Tạo payment (thay POST /sepay/create)
@Post('create')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')

  @HttpCode(HttpStatus.CREATED)
  async createPayment(
    @Body() body: CreatePaymentDto,
    @Request() req
  ) {
    const userId = req.user?.id;
    if (!userId) {
      return { statusCode: 401, message: 'Unauthorized: Missing userId in JWT' };
    }
    return this.paymentGatewayService.createPayment(userId, body.amount);
  }

  // Check status (SePay only)
  @Get('check/:transactionId')
  async checkStatus(@Param('transactionId') transactionId: string) {
    return this.paymentGatewayService.checkPaymentStatus(transactionId);
  }
}