import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserModule } from '../User/User.module';
import { ReviewModule } from '../review/review.module';
import { SubscriptionPayment } from '../subscription/entities/subscription-payment.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';

@Module({
  imports: [
    UserModule,
    ReviewModule,
    TypeOrmModule.forFeature([
      SubscriptionPayment,
      UserSubscription,
      SubscriptionPlan,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
