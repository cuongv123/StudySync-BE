import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review } from './entities/review.entity';
import { SharedAuthModule } from '../../common/auth/shared-auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    SharedAuthModule,
  ],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Apply globally for this module
    },
  ],
  exports: [ReviewService],
})
export class ReviewModule {}
