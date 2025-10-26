import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { WebhookController } from './webhook.controller';
import { PaymentService } from './payment.service';
import { SubscriptionPayment } from '../subscription/entities/subscription-payment.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { PayOSService } from '../subscription/services/payos.service';
import { JwtStrategy } from '../auth/strategies/jwt.auth.strategies';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPayment,
      SubscriptionPlan,
      UserSubscription,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
  ],
  controllers: [PaymentController, WebhookController],
  providers: [
    JwtStrategy,
    PaymentService,
    PayOSService,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
