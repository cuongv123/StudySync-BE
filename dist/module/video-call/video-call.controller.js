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
exports.VideoCallController = void 0;
const common_1 = require("@nestjs/common");
const video_call_service_1 = require("./video-call.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
const start_call_dto_1 = require("./dto/start-call.dto");
const join_call_dto_1 = require("./dto/join-call.dto");
const swagger_1 = require("@nestjs/swagger");
let VideoCallController = class VideoCallController {
    constructor(videoCallService) {
        this.videoCallService = videoCallService;
    }
    async startCall(req, startCallDto) {
        return this.videoCallService.startCall(startCallDto, req.user.id);
    }
    async joinCall(req, id, joinCallDto) {
        return this.videoCallService.joinCall(joinCallDto, req.user.id);
    }
    async leaveCall(req, id) {
        await this.videoCallService.leaveCall(id, req.user.id);
        return { message: 'Left call successfully' };
    }
    async endCall(req, id) {
        await this.videoCallService.endCall(id, req.user.id);
        return { message: 'Call ended successfully' };
    }
    async getCallDetails(req, id) {
        return this.videoCallService.getCallDetails(id, req.user.id);
    }
    async getParticipants(id) {
        return this.videoCallService.getCallParticipants(id);
    }
    async getGroupActiveCalls(req, groupId) {
        return this.videoCallService.getGroupActiveCalls(groupId, req.user.id);
    }
    async getCallHistory(req, groupId) {
        return this.videoCallService.getCallHistory(groupId, req.user.id);
    }
};
exports.VideoCallController = VideoCallController;
__decorate([
    (0, common_1.Post)('start'),
    (0, swagger_1.ApiOperation)({ summary: 'Start a new video call in a group' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Call started successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Call already ongoing in group' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not a member of the group' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_call_dto_1.StartCallDto]),
    __metadata("design:returntype", Promise)
], VideoCallController.prototype, "startCall", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, swagger_1.ApiOperation)({ summary: 'Join an ongoing video call' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Joined call successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Call not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Call is not active' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, join_call_dto_1.JoinCallDto]),
    __metadata("design:returntype", Promise)
], VideoCallController.prototype, "joinCall", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave a video call' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Left call successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Call not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'You are not a participant in this call' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], VideoCallController.prototype, "leaveCall", null);
__decorate([
    (0, common_1.Post)(':id/end'),
    (0, swagger_1.ApiOperation)({ summary: 'End a video call (host only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call ended successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only the host can end the call' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], VideoCallController.prototype, "endCall", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get call details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call details retrieved' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Call not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], VideoCallController.prototype, "getCallDetails", null);
__decorate([
    (0, common_1.Get)(':id/participants'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active participants in a call' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Participants retrieved' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], VideoCallController.prototype, "getParticipants", null);
__decorate([
    (0, common_1.Get)('group/:groupId/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active calls for a group' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active calls retrieved' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], VideoCallController.prototype, "getGroupActiveCalls", null);
__decorate([
    (0, common_1.Get)('group/:groupId/history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get call history for a group' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call history retrieved' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], VideoCallController.prototype, "getCallHistory", null);
exports.VideoCallController = VideoCallController = __decorate([
    (0, swagger_1.ApiTags)('Video Calls'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('video-calls'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [video_call_service_1.VideoCallService])
], VideoCallController);
//# sourceMappingURL=video-call.controller.js.map