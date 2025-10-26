import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { AiQueryHistory } from './entities/ai-query-history.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiQueryHistory,
      UserSubscription,
    ]),
  ],
  controllers: [AiChatController],
  providers: [AiChatService],
  exports: [AiChatService],
})
export class AiChatModule {}
