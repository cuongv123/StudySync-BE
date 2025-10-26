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
var NotificationGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const User_service_1 = require("../User/User.service");
let NotificationGateway = NotificationGateway_1 = class NotificationGateway {
    constructor(jwtService, userService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.logger = new common_1.Logger(NotificationGateway_1.name);
        this.connectedUsers = new Map();
    }
    async handleConnection(client) {
        var _a, _b, _c;
        try {
            const token = ((_a = client.handshake.auth) === null || _a === void 0 ? void 0 : _a.token) || ((_c = (_b = client.handshake.headers) === null || _b === void 0 ? void 0 : _b.authorization) === null || _c === void 0 ? void 0 : _c.replace('Bearer ', ''));
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token`);
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            const user = await this.userService.findOne(payload.id);
            if (!user) {
                this.logger.warn(`Invalid user for token: ${payload.id}`);
                client.disconnect();
                return;
            }
            client.userId = user.id;
            client.user = user;
            this.connectedUsers.set(user.id, client.id);
            await client.join(`user_${user.id}`);
            this.logger.log(`User ${user.username} (${user.id}) connected: ${client.id}`);
            client.emit('connection_success', {
                message: 'Connected to notification service',
                userId: user.id,
            });
        }
        catch (error) {
            this.logger.error(`Connection error for client ${client.id}:`, error instanceof Error ? error.message : String(error));
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        if (client.userId) {
            this.connectedUsers.delete(client.userId);
            this.logger.log(`User ${client.userId} disconnected: ${client.id}`);
        }
        else {
            this.logger.log(`Unauthenticated client disconnected: ${client.id}`);
        }
    }
    async handleJoinGroupNotifications(client, data) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }
            await client.join(`group_${data.groupId}`);
            this.logger.log(`User ${client.userId} joined group notifications: ${data.groupId}`);
            client.emit('joined_group_notifications', { groupId: data.groupId });
        }
        catch (error) {
            this.logger.error(`Error joining group notifications:`, error instanceof Error ? error.message : String(error));
            client.emit('error', { message: 'Failed to join group notifications' });
        }
    }
    async handleLeaveGroupNotifications(client, data) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }
            await client.leave(`group_${data.groupId}`);
            this.logger.log(`User ${client.userId} left group notifications: ${data.groupId}`);
            client.emit('left_group_notifications', { groupId: data.groupId });
        }
        catch (error) {
            this.logger.error(`Error leaving group notifications:`, error instanceof Error ? error.message : String(error));
            client.emit('error', { message: 'Failed to leave group notifications' });
        }
    }
    async emitToUser(userId, event, data) {
        this.server.to(`user_${userId}`).emit(event, data);
        this.logger.log(`Emitted ${event} to user ${userId}`);
    }
    async emitToGroup(groupId, event, data) {
        this.server.to(`group_${groupId}`).emit(event, data);
        this.logger.log(`Emitted ${event} to group ${groupId}`);
    }
    async emitToMultipleUsers(userIds, event, data) {
        userIds.forEach(userId => {
            this.server.to(`user_${userId}`).emit(event, data);
        });
        this.logger.log(`Emitted ${event} to ${userIds.length} users`);
    }
    async emitChatNotification(userId, data) {
        this.server.to(`user_${userId}`).emit('new_chat_message', data);
        this.logger.log(`Emitted new_chat_message to user ${userId}`);
    }
    async emitSystemNotification(userId, data) {
        this.server.to(`user_${userId}`).emit('new_system_notification', data);
        this.logger.log(`Emitted new_system_notification to user ${userId}`);
    }
    isUserConnected(userId) {
        return this.connectedUsers.has(userId);
    }
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
};
exports.NotificationGateway = NotificationGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_group_notifications'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleJoinGroupNotifications", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_group_notifications'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotificationGateway.prototype, "handleLeaveGroupNotifications", null);
exports.NotificationGateway = NotificationGateway = NotificationGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/notifications',
    }),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => User_service_1.UsersService))),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        User_service_1.UsersService])
], NotificationGateway);
//# sourceMappingURL=notification.gateway.js.map