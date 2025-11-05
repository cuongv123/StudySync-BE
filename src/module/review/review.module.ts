import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { Review } from './entities/review.entity';
import { SharedAuthModule } from '../../common/auth/shared-auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    SharedAuthModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
