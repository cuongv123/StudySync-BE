import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoCall } from './entities/video-call.entity';
import { CallParticipant } from './entities/call-participant.entity';
import { GroupMember } from '../group/entities/group-member.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { CallStatus } from '../../common/enums/call-status.enum';
import { StartCallDto } from './dto/start-call.dto';
import { JoinCallDto } from './dto/join-call.dto';

@Injectable()
export class VideoCallService {
  constructor(
    @InjectRepository(VideoCall)
    private videoCallRepository: Repository<VideoCall>,
    @InjectRepository(CallParticipant)
    private participantRepository: Repository<CallParticipant>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(UserSubscription)
    private userSubscriptionRepository: Repository<UserSubscription>,
  ) {}

  async startCall(startCallDto: StartCallDto, userId: string): Promise<VideoCall> {
    const { groupId, callTitle } = startCallDto;

    // Check if user is member of group
    const member = await this.groupMemberRepository.findOne({
      where: { userId, groupId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Check video call minutes limit
    await this.checkVideoCallLimit(userId);

    // Check if there's already an ongoing call
    const existingCall = await this.videoCallRepository.findOne({
      where: {
        groupId,
        status: CallStatus.ONGOING,
      },
    });

    if (existingCall) {
      throw new BadRequestException('There is already an ongoing call in this group');
    }

    // Create new call
    const call = this.videoCallRepository.create({
      groupId,
      callTitle: callTitle || 'Group Video Call',
      startedBy: userId,
      status: CallStatus.ONGOING,
    });

    const savedCall = await this.videoCallRepository.save(call);

    // Add starter as first participant
    const participant = this.participantRepository.create({
      callId: savedCall.id,
      userId,
    });

    await this.participantRepository.save(participant);

    return this.videoCallRepository.findOne({
      where: { id: savedCall.id },
      relations: ['group', 'starter', 'participants', 'participants.user'],
    });
  }

  async joinCall(joinCallDto: JoinCallDto, userId: string): Promise<CallParticipant> {
    const { callId, peerId } = joinCallDto;

    // Get call
    const call = await this.videoCallRepository.findOne({
      where: { id: callId },
      relations: ['group'],
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.status !== CallStatus.ONGOING) {
      throw new BadRequestException('Call is not active');
    }

    // Check if user is member of group
    const member = await this.groupMemberRepository.findOne({
      where: { userId, groupId: call.groupId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Check if already joined
    let participant = await this.participantRepository.findOne({
      where: { callId, userId, isActive: true },
    });

    if (participant) {
      // Update peer ID if changed
      participant.peerId = peerId;
      return this.participantRepository.save(participant);
    }

    // Create new participant
    participant = this.participantRepository.create({
      callId,
      userId,
      peerId,
    });

    return this.participantRepository.save(participant);
  }

  async leaveCall(callId: number, userId: string): Promise<void> {
    // Kiểm tra call có tồn tại không
    const call = await this.videoCallRepository.findOne({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    // Kiểm tra user có đang tham gia call này không
    const participant = await this.participantRepository.findOne({
      where: { callId, userId, isActive: true },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this call');
    }

    // Rời khỏi call
    participant.isActive = false;
    participant.leftAt = new Date();
    await this.participantRepository.save(participant);

    // Check if call should end (no active participants)
    const activeParticipants = await this.participantRepository.count({
      where: { callId, isActive: true },
    });

    if (activeParticipants === 0) {
      await this.endCallInternal(callId);
    }
  }

  async endCall(callId: number, userId: string): Promise<void> {
    const call = await this.videoCallRepository.findOne({
      where: { id: callId },
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    // Kiểm tra chỉ host mới được end call
    if (call.startedBy !== userId) {
      throw new ForbiddenException('Only the host can end the call');
    }

    await this.endCallInternal(callId);
  }

  private async endCallInternal(callId: number): Promise<void> {
    const call = await this.videoCallRepository.findOne({
      where: { id: callId },
    });

    if (call && call.status === CallStatus.ONGOING) {
      call.status = CallStatus.ENDED;
      call.endedAt = new Date();
      await this.videoCallRepository.save(call);

      // Mark all participants as inactive
      await this.participantRepository.update(
        { callId, isActive: true },
        { isActive: false, leftAt: new Date() },
      );
    }
  }

  async getCallDetails(callId: number, userId: string): Promise<VideoCall> {
    const call = await this.videoCallRepository.findOne({
      where: { id: callId },
      relations: ['group', 'starter', 'participants', 'participants.user'],
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    // Check if user is member of group
    const member = await this.groupMemberRepository.findOne({
      where: { userId, groupId: call.groupId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return call;
  }

  async getCallParticipants(callId: number): Promise<CallParticipant[]> {
    return this.participantRepository.find({
      where: { callId, isActive: true },
      relations: ['user'],
    });
  }

  async getGroupActiveCalls(groupId: number, userId: string): Promise<VideoCall[]> {
    // Check if user is member
    const member = await this.groupMemberRepository.findOne({
      where: { userId, groupId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return this.videoCallRepository.find({
      where: {
        groupId,
        status: CallStatus.ONGOING,
      },
      relations: ['starter', 'participants', 'participants.user'],
      order: { startedAt: 'DESC' },
    });
  }

  async getCallHistory(groupId: number, userId: string): Promise<VideoCall[]> {
    // Check if user is member
    const member = await this.groupMemberRepository.findOne({
      where: { userId, groupId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this group');
    }

    return this.videoCallRepository.find({
      where: { groupId },
      relations: ['starter'],
      order: { startedAt: 'DESC' },
      take: 50,
    });
  }

  async updateParticipantAudio(
    callId: number,
    userId: string,
    isMuted: boolean,
  ): Promise<void> {
    await this.participantRepository.update(
      { callId, userId, isActive: true },
      { isMuted },
    );
  }

  async updateParticipantVideo(
    callId: number,
    userId: string,
    isVideoOff: boolean,
  ): Promise<void> {
    await this.participantRepository.update(
      { callId, userId, isActive: true },
      { isVideoOff },
    );
  }

  async handleUserDisconnect(userId: string): Promise<void> {
    // Find all active participations
    const activeParticipations = await this.participantRepository.find({
      where: { userId, isActive: true },
    });

    for (const participant of activeParticipations) {
      await this.leaveCall(participant.callId, userId);
    }
  }

  /**
   * Check video call minutes limit based on subscription plan
   */
  private async checkVideoCallLimit(userId: string): Promise<void> {
    const subscription = await this.userSubscriptionRepository.findOne({
      where: { userId, isActive: true },
      relations: ['plan'],
    });

    // Nếu không có subscription, lấy Free plan (id=1) từ database
    if (!subscription) {
      const freePlan = await this.userSubscriptionRepository.manager
        .getRepository('SubscriptionPlan')
        .findOne({ where: { id: 1 } });
      
      const freeLimit = freePlan?.videoCallMinutesLimit || 15; // Default 15 phút
      
      // Tính tổng số phút đã sử dụng
      const calls = await this.videoCallRepository.find({
        where: { startedBy: userId, status: CallStatus.ENDED },
      });
      
      const usedMinutes = calls.reduce((total, call) => {
        if (call.endedAt && call.startedAt) {
          const duration = (call.endedAt.getTime() - call.startedAt.getTime()) / (1000 * 60);
          return total + duration;
        }
        return total;
      }, 0);
      
      if (usedMinutes >= freeLimit) {
        throw new BadRequestException(
          `Video call limit reached (${Math.round(usedMinutes)}/${freeLimit} minutes for Free plan). Please upgrade to Pro or Pro Max plan.`
        );
      }
      return;
    }

    // Check limit theo plan
    const used = subscription.usageVideoMinutes || 0;
    const limit = subscription.plan.videoCallMinutesLimit;
    const planName = subscription.plan.planName;

    if (used >= limit) {
      throw new BadRequestException(
        `Video call limit reached (${Math.round(used)}/${limit} minutes for ${planName} plan). Please upgrade your plan or wait for monthly reset.`
      );
    }
  }
}
