import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { SubscriptionPayment } from './entities/subscription-payment.entity';
import { SubscriptionService } from './subscription.service';
import { PayOSService } from './services/payos.service';
import { SubscriptionController } from './subscription.controller';
import { JwtStrategy } from '../auth/strategies/jwt.auth.strategies';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      UserSubscription,
      SubscriptionPayment,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
  ],
  controllers: [SubscriptionController],
  providers: [
    JwtStrategy,
    SubscriptionService,
    PayOSService,
  ],
  exports: [
    SubscriptionService,
    TypeOrmModule,
  ],
})
export class SubscriptionModule {}
