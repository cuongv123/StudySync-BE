"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoCallService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const video_call_entity_1 = require("./entities/video-call.entity");
const call_participant_entity_1 = require("./entities/call-participant.entity");
const group_member_entity_1 = require("../group/entities/group-member.entity");
const call_status_enum_1 = require("../../common/enums/call-status.enum");
let VideoCallService = class VideoCallService {
    constructor(videoCallRepository, participantRepository, groupMemberRepository) {
        this.videoCallRepository = videoCallRepository;
        this.participantRepository = participantRepository;
        this.groupMemberRepository = groupMemberRepository;
    }
    async startCall(startCallDto, userId) {
        const { groupId, callTitle } = startCallDto;
        const member = await this.groupMemberRepository.findOne({
            where: { userId, groupId },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        const existingCall = await this.videoCallRepository.findOne({
            where: {
                groupId,
                status: call_status_enum_1.CallStatus.ONGOING,
            },
        });
        if (existingCall) {
            throw new common_1.BadRequestException('There is already an ongoing call in this group');
        }
        const call = this.videoCallRepository.create({
            groupId,
            callTitle: callTitle || 'Group Video Call',
            startedBy: userId,
            status: call_status_enum_1.CallStatus.ONGOING,
        });
        const savedCall = await this.videoCallRepository.save(call);
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
    async joinCall(joinCallDto, userId) {
        const { callId, peerId } = joinCallDto;
        const call = await this.videoCallRepository.findOne({
            where: { id: callId },
            relations: ['group'],
        });
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        if (call.status !== call_status_enum_1.CallStatus.ONGOING) {
            throw new common_1.BadRequestException('Call is not active');
        }
        const member = await this.groupMemberRepository.findOne({
            where: { userId, groupId: call.groupId },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        let participant = await this.participantRepository.findOne({
            where: { callId, userId, isActive: true },
        });
        if (participant) {
            participant.peerId = peerId;
            return this.participantRepository.save(participant);
        }
        participant = this.participantRepository.create({
            callId,
            userId,
            peerId,
        });
        return this.participantRepository.save(participant);
    }
    async leaveCall(callId, userId) {
        const call = await this.videoCallRepository.findOne({
            where: { id: callId },
        });
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        const participant = await this.participantRepository.findOne({
            where: { callId, userId, isActive: true },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('You are not a participant in this call');
        }
        participant.isActive = false;
        participant.leftAt = new Date();
        await this.participantRepository.save(participant);
        const activeParticipants = await this.participantRepository.count({
            where: { callId, isActive: true },
        });
        if (activeParticipants === 0) {
            await this.endCallInternal(callId);
        }
    }
    async endCall(callId, userId) {
        const call = await this.videoCallRepository.findOne({
            where: { id: callId },
        });
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        if (call.startedBy !== userId) {
            throw new common_1.ForbiddenException('Only the host can end the call');
        }
        await this.endCallInternal(callId);
    }
    async endCallInternal(callId) {
        const call = await this.videoCallRepository.findOne({
            where: { id: callId },
        });
        if (call && call.status === call_status_enum_1.CallStatus.ONGOING) {
            call.status = call_status_enum_1.CallStatus.ENDED;
            call.endedAt = new Date();
            await this.videoCallRepository.save(call);
            await this.participantRepository.update({ callId, isActive: true }, { isActive: false, leftAt: new Date() });
        }
    }
    async getCallDetails(callId, userId) {
        const call = await this.videoCallRepository.findOne({
            where: { id: callId },
            relations: ['group', 'starter', 'participants', 'participants.user'],
        });
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        const member = await this.groupMemberRepository.findOne({
            where: { userId, groupId: call.groupId },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        return call;
    }
    async getCallParticipants(callId) {
        return this.participantRepository.find({
            where: { callId, isActive: true },
            relations: ['user'],
        });
    }
    async getGroupActiveCalls(groupId, userId) {
        const member = await this.groupMemberRepository.findOne({
            where: { userId, groupId },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        return this.videoCallRepository.find({
            where: {
                groupId,
                status: call_status_enum_1.CallStatus.ONGOING,
            },
            relations: ['starter', 'participants', 'participants.user'],
            order: { startedAt: 'DESC' },
        });
    }
    async getCallHistory(groupId, userId) {
        const member = await this.groupMemberRepository.findOne({
            where: { userId, groupId },
        });
        if (!member) {
            throw new common_1.ForbiddenException('You are not a member of this group');
        }
        return this.videoCallRepository.find({
            where: { groupId },
            relations: ['starter'],
            order: { startedAt: 'DESC' },
            take: 50,
        });
    }
    async updateParticipantAudio(callId, userId, isMuted) {
        await this.participantRepository.update({ callId, userId, isActive: true }, { isMuted });
    }
    async updateParticipantVideo(callId, userId, isVideoOff) {
        await this.participantRepository.update({ callId, userId, isActive: true }, { isVideoOff });
    }
    async handleUserDisconnect(userId) {
        const activeParticipations = await this.participantRepository.find({
            where: { userId, isActive: true },
        });
        for (const participant of activeParticipations) {
            await this.leaveCall(participant.callId, userId);
        }
    }
};
exports.VideoCallService = VideoCallService;
exports.VideoCallService = VideoCallService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(video_call_entity_1.VideoCall)),
    __param(1, (0, typeorm_1.InjectRepository)(call_participant_entity_1.CallParticipant)),
    __param(2, (0, typeorm_1.InjectRepository)(group_member_entity_1.GroupMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], VideoCallService);
//# sourceMappingURL=video-call.service.js.map