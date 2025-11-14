import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEventController } from './group-event.controller';
import { GroupEventService } from './services/group-event.service';
import { EventCleanupService } from './services/event-cleanup.service';
import { GroupEvent } from './entities/group-event.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { StudyGroup } from '../group/entities/group.entity';
import { User } from '../User/entities/User.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupEvent, EventParticipant, StudyGroup, User]),
    NotificationModule,
  ],
  controllers: [GroupEventController],
  providers: [GroupEventService, EventCleanupService],
  exports: [GroupEventService],
})
export class GroupEventModule {}
