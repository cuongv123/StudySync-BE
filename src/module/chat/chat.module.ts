import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { Message } from './entities/message.entity';
import { StudyGroup } from '../group/entities/group.entity';
import { GroupMember } from '../group/entities/group-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, StudyGroup, GroupMember]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
