import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { StudyGroup } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupInvitation } from './entities/group-invitation.entity';
import { User } from '../User/entities/User.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyGroup, GroupMember, GroupInvitation, User]),
    NotificationModule
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}