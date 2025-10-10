import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoCallService } from './video-call.service';
import { VideoCallController } from './video-call.controller';
import { VideoCallGateway } from './video-call.gateway';
import { VideoCall } from './entities/video-call.entity';
import { CallParticipant } from './entities/call-participant.entity';
import { GroupMember } from '../group/entities/group-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VideoCall, CallParticipant, GroupMember]),
  ],
  controllers: [VideoCallController],
  providers: [VideoCallService, VideoCallGateway],
  exports: [VideoCallService],
})
export class VideoCallModule {}
