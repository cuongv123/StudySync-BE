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
var VideoCallGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoCallGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const video_call_service_1 = require("./video-call.service");
let VideoCallGateway = VideoCallGateway_1 = class VideoCallGateway {
    constructor(videoCallService) {
        this.videoCallService = videoCallService;
        this.logger = new common_1.Logger(VideoCallGateway_1.name);
        this.userSocketMap = new Map();
        this.socketUserMap = new Map();
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const userId = this.socketUserMap.get(client.id);
        if (userId) {
            await this.videoCallService.handleUserDisconnect(userId);
            this.userSocketMap.delete(userId);
            this.socketUserMap.delete(client.id);
            client.broadcast.emit('user-left', { userId });
        }
    }
    handleRegisterUser(client, data) {
        const { userId } = data;
        this.userSocketMap.set(userId, client.id);
        this.socketUserMap.set(client.id, userId);
        this.logger.log(`User registered: ${userId} with socket ${client.id}`);
        return { success: true, userId };
    }
    async handleJoinCall(client, data) {
        var _a;
        const { callId, userId, peerId } = data;
        this.logger.log(`User ${userId} joining call ${callId} with peer ${peerId}`);
        const room = `call-${callId}`;
        await client.join(room);
        const participants = await this.videoCallService.getCallParticipants(callId);
        client.to(room).emit('user-joined', {
            userId,
            peerId,
            user: (_a = participants.find(p => p.userId === userId)) === null || _a === void 0 ? void 0 : _a.user,
        });
        return {
            success: true,
            participants: participants.filter(p => p.userId !== userId),
        };
    }
    async handleLeaveCall(client, data) {
        const { callId, userId } = data;
        this.logger.log(`User ${userId} leaving call ${callId}`);
        const room = `call-${callId}`;
        client.to(room).emit('user-left', { userId });
        await client.leave(room);
        await this.videoCallService.leaveCall(callId, userId);
        return { success: true };
    }
    handleSignal(client, data) {
        const { callId, fromUserId, toUserId, signal, type } = data;
        this.logger.log(`Signal from ${fromUserId} to ${toUserId}: ${type}`);
        if (toUserId) {
            const targetSocketId = this.userSocketMap.get(toUserId);
            if (targetSocketId) {
                this.server.to(targetSocketId).emit('signal', {
                    fromUserId,
                    signal,
                    type,
                });
            }
        }
        else {
            const room = `call-${callId}`;
            client.to(room).emit('signal', {
                fromUserId,
                signal,
                type,
            });
        }
    }
    handleToggleAudio(client, data) {
        const { callId, userId, isMuted } = data;
        const room = `call-${callId}`;
        client.to(room).emit('user-audio-changed', { userId, isMuted });
        this.videoCallService.updateParticipantAudio(callId, userId, isMuted);
        return { success: true };
    }
    handleToggleVideo(client, data) {
        const { callId, userId, isVideoOff } = data;
        const room = `call-${callId}`;
        client.to(room).emit('user-video-changed', { userId, isVideoOff });
        this.videoCallService.updateParticipantVideo(callId, userId, isVideoOff);
        return { success: true };
    }
    notifyGroupCall(groupId, call) {
        this.server.emit('new-call', {
            groupId,
            call,
        });
    }
    notifyCallEnded(callId) {
        const room = `call-${callId}`;
        this.server.to(room).emit('call-ended', { callId });
    }
};
exports.VideoCallGateway = VideoCallGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], VideoCallGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('register-user'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], VideoCallGateway.prototype, "handleRegisterUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-call'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], VideoCallGateway.prototype, "handleJoinCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-call'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], VideoCallGateway.prototype, "handleLeaveCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('signal'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], VideoCallGateway.prototype, "handleSignal", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('toggle-audio'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], VideoCallGateway.prototype, "handleToggleAudio", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('toggle-video'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], VideoCallGateway.prototype, "handleToggleVideo", null);
exports.VideoCallGateway = VideoCallGateway = VideoCallGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/video-call',
    }),
    __metadata("design:paramtypes", [video_call_service_1.VideoCallService])
], VideoCallGateway);
//# sourceMappingURL=video-call.gateway.js.map