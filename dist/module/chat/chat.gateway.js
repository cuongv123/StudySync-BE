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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const connectedUsers = new Map();
const userRooms = new Map();
let ChatGateway = class ChatGateway {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async handleConnection(client) {
        var _a;
        try {
            const userId = client.handshake.auth.userId || client.handshake.query.userId;
            if (!userId) {
                console.log('❌ Connection rejected: No userId provided');
                client.disconnect();
                return;
            }
            if (!connectedUsers.has(userId)) {
                connectedUsers.set(userId, new Set());
            }
            (_a = connectedUsers.get(userId)) === null || _a === void 0 ? void 0 : _a.add(client.id);
            console.log(`✅ User ${userId} connected with socket ${client.id}`);
            console.log(`📊 Total connected users: ${connectedUsers.size}`);
            this.server.emit('user:online', { userId });
        }
        catch (error) {
            console.error('Error in handleConnection:', error);
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        try {
            const userId = client.handshake.auth.userId || client.handshake.query.userId;
            if (userId && connectedUsers.has(userId)) {
                const userSockets = connectedUsers.get(userId);
                userSockets === null || userSockets === void 0 ? void 0 : userSockets.delete(client.id);
                if ((userSockets === null || userSockets === void 0 ? void 0 : userSockets.size) === 0) {
                    connectedUsers.delete(userId);
                    this.server.emit('user:offline', { userId });
                    console.log(`🔴 User ${userId} went offline`);
                }
            }
            const groupId = userRooms.get(client.id);
            if (groupId) {
                client.leave(`group:${groupId}`);
                userRooms.delete(client.id);
            }
            console.log(`👋 Socket ${client.id} disconnected`);
            console.log(`📊 Remaining connected users: ${connectedUsers.size}`);
        }
        catch (error) {
            console.error('Error in handleDisconnect:', error);
        }
    }
    async handleJoinRoom(client, data) {
        try {
            const userId = client.handshake.auth.userId || client.handshake.query.userId;
            const { groupId } = data;
            if (!userId || !groupId) {
                return { success: false, message: 'Missing userId or groupId' };
            }
            const previousRoom = userRooms.get(client.id);
            if (previousRoom) {
                client.leave(`group:${previousRoom}`);
            }
            const roomName = `group:${groupId}`;
            client.join(roomName);
            userRooms.set(client.id, groupId);
            console.log(`🚪 User ${userId} joined room ${roomName}`);
            client.to(roomName).emit('user:joined', {
                userId,
                groupId,
                timestamp: new Date(),
            });
            return {
                success: true,
                message: `Joined group ${groupId}`,
                groupId,
            };
        }
        catch (error) {
            console.error('Error in handleJoinRoom:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async handleLeaveRoom(client, data) {
        try {
            const userId = client.handshake.auth.userId || client.handshake.query.userId;
            const { groupId } = data;
            const roomName = `group:${groupId}`;
            client.leave(roomName);
            userRooms.delete(client.id);
            console.log(`👋 User ${userId} left room ${roomName}`);
            client.to(roomName).emit('user:left', {
                userId,
                groupId,
                timestamp: new Date(),
            });
            return { success: true, message: `Left group ${groupId}` };
        }
        catch (error) {
            console.error('Error in handleLeaveRoom:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async handleSendMessage(client, data) {
        try {
            const userId = client.handshake.auth.userId || client.handshake.query.userId;
            const { groupId, message } = data;
            if (!userId || !groupId || !message) {
                return { success: false, message: 'Missing required data' };
            }
            const savedMessage = await this.chatService.sendMessage(userId, groupId, message);
            const fullMessage = await this.chatService.getMessageById(userId, groupId, savedMessage.id);
            const roomName = `group:${groupId}`;
            this.server.to(roomName).emit('chat:message', {
                message: fullMessage,
                groupId,
            });
            console.log(`💬 Message sent to group ${groupId} by user ${userId}`);
            return {
                success: true,
                message: fullMessage,
            };
        }
        catch (error) {
            console.error('Error in handleSendMessage:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to send message',
            };
        }
    }
    async handleUpdateMessage(client, data) {
        try {
            const userId = client.handshake.auth.userId || client.handshake.query.userId;
            const { groupId, messageId, content } = data;
            const updatedMessage = await this.chatService.updateMessage(userId, groupId, messageId, content);
            const roomName = `group:${groupId}`;
            this.server.to(roomName).emit('chat:updated', {
                message: updatedMessage,
                groupId,
            });
            console.log(`✏️ Message ${messageId} updated in group ${groupId}`);
            return { success: true, message: updatedMessage };
        }
        catch (error) {
            console.error('Error in handleUpdateMessage:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async handleDeleteMessage(client, data) {
        try {
            const userId = client.handshake.auth.userId || client.handshake.query.userId;
            const { groupId, messageId } = data;
            await this.chatService.deleteMessage(userId, groupId, messageId);
            const roomName = `group:${groupId}`;
            this.server.to(roomName).emit('chat:deleted', {
                messageId,
                groupId,
            });
            console.log(`🗑️ Message ${messageId} deleted in group ${groupId}`);
            return { success: true, messageId };
        }
        catch (error) {
            console.error('Error in handleDeleteMessage:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async handleTyping(client, data) {
        try {
            const userId = client.handshake.auth.userId || client.handshake.query.userId;
            const { groupId, isTyping } = data;
            const roomName = `group:${groupId}`;
            client.to(roomName).emit('user:typing', {
                userId,
                groupId,
                isTyping,
            });
            return { success: true };
        }
        catch (error) {
            console.error('Error in handleTyping:', error);
            return { success: false };
        }
    }
    async handleGetOnlineUsers(client, data) {
        try {
            const { groupId } = data;
            const roomName = `group:${groupId}`;
            const room = this.server.sockets.adapter.rooms.get(roomName);
            const onlineUserIds = new Set();
            if (room) {
                room.forEach((socketId) => {
                    const socket = this.server.sockets.sockets.get(socketId);
                    if (socket) {
                        const userId = socket.handshake.auth.userId || socket.handshake.query.userId;
                        if (userId) {
                            onlineUserIds.add(userId);
                        }
                    }
                });
            }
            return {
                success: true,
                onlineUsers: Array.from(onlineUserIds),
                count: onlineUserIds.size,
            };
        }
        catch (error) {
            console.error('Error in handleGetOnlineUsers:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:send'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:update'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleUpdateMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:delete'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDeleteMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat:getOnlineUsers'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetOnlineUsers", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map