import { Repository } from 'typeorm';
import { VideoCall } from './entities/video-call.entity';
import { CallParticipant } from './entities/call-participant.entity';
import { GroupMember } from '../group/entities/group-member.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { StartCallDto } from './dto/start-call.dto';
import { JoinCallDto } from './dto/join-call.dto';
export declare class VideoCallService {
    private videoCallRepository;
    private participantRepository;
    private groupMemberRepository;
    private userSubscriptionRepository;
    constructor(videoCallRepository: Repository<VideoCall>, participantRepository: Repository<CallParticipant>, groupMemberRepository: Repository<GroupMember>, userSubscriptionRepository: Repository<UserSubscription>);
    startCall(startCallDto: StartCallDto, userId: string): Promise<VideoCall>;
    joinCall(joinCallDto: JoinCallDto, userId: string): Promise<CallParticipant>;
    leaveCall(callId: number, userId: string): Promise<void>;
    endCall(callId: number, userId: string): Promise<void>;
    private endCallInternal;
    getCallDetails(callId: number, userId: string): Promise<VideoCall>;
    getCallParticipants(callId: number): Promise<CallParticipant[]>;
    getGroupActiveCalls(groupId: number, userId: string): Promise<VideoCall[]>;
    getCallHistory(groupId: number, userId: string): Promise<VideoCall[]>;
    updateParticipantAudio(callId: number, userId: string, isMuted: boolean): Promise<void>;
    updateParticipantVideo(callId: number, userId: string, isVideoOff: boolean): Promise<void>;
    handleUserDisconnect(userId: string): Promise<void>;
    private checkVideoCallLimit;
}
