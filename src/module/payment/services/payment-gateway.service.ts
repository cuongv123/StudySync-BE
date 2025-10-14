// src/payment/services/payment-gateway.service.ts

import { Injectable } from '@nestjs/common';
import { SepayService } from './sepay.service';

@Injectable()
export class PaymentGatewayService {
  constructor(
    private readonly sepayService: SepayService,
  ) {}

  // Tạo payment (SePay only)
  async createPayment(userId: string, amount: number) {
    return this.sepayService.createPayment(userId, amount);
  }

  // Check payment status (SePay only)
  async checkPaymentStatus(transactionId: string) {
    return this.sepayService.checkPaymentStatus(transactionId);
  }
}