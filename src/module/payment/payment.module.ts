import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { UserWallet } from './entities/user-wallet.entity';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { PaymentAttempt } from './entities/payment-attempt.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { Payment } from './entities/payment.entity';
import { WalletService } from './services/wallet.service';
import { PaymentAttemptService } from './services/payment-attempt.service';
import { SepayService } from './services/sepay.service';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { SubscriptionService } from './services/subscription.service';
import { PaymentGatewayController } from './payment-gateway.controller';
import { SubscriptionController } from './subscription.controller';
import { JwtStrategy } from '../auth/strategies/jwt.auth.strategies';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserWallet,
      WalletTransaction,
      PaymentAttempt,
      SubscriptionPlan,
      UserSubscription,
      Payment,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [PaymentGatewayController, SubscriptionController],
  providers: [
    JwtStrategy,
    WalletService,
    PaymentAttemptService,
    SepayService,
    PaymentGatewayService,
    SubscriptionService,
  ],
  exports: [
    WalletService,
    PaymentAttemptService,
    SepayService,
    PaymentGatewayService,
    SubscriptionService,
    TypeOrmModule,
  ],
})
export class PaymentModule {}