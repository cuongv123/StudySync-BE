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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const chat_service_1 = require("./chat.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const update_message_dto_1 = require("./dto/update-message.dto");
const get_messages_dto_1 = require("./dto/get-messages.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async sendMessage(req, groupId, createMessageDto) {
        const userId = req.user.id;
        const message = await this.chatService.sendMessage(userId, groupId, createMessageDto);
        return {
            success: true,
            message: 'Tin nhắn đã được gửi',
            data: message,
        };
    }
    async getMessages(req, groupId, getMessagesDto) {
        const userId = req.user.id;
        const result = await this.chatService.getMessages(userId, groupId, getMessagesDto);
        return {
            success: true,
            message: 'Lấy danh sách tin nhắn thành công',
            data: result,
        };
    }
    async getMessageById(req, groupId, messageId) {
        const userId = req.user.id;
        const message = await this.chatService.getMessageById(userId, groupId, messageId);
        return {
            success: true,
            message: 'Lấy chi tiết tin nhắn thành công',
            data: message,
        };
    }
    async updateMessage(req, groupId, messageId, updateMessageDto) {
        const userId = req.user.id;
        const message = await this.chatService.updateMessage(userId, groupId, messageId, updateMessageDto);
        return {
            success: true,
            message: 'Tin nhắn đã được cập nhật',
            data: message,
        };
    }
    async deleteMessage(req, groupId, messageId) {
        const userId = req.user.id;
        await this.chatService.deleteMessage(userId, groupId, messageId);
        return {
            success: true,
            message: 'Tin nhắn đã được xóa',
        };
    }
    async getUnreadCount(req, groupId) {
        const userId = req.user.id;
        const count = await this.chatService.getUnreadCount(userId, groupId);
        return {
            success: true,
            message: 'Lấy số tin nhắn chưa đọc thành công',
            data: { count },
        };
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Gửi tin nhắn (REST API fallback)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tin nhắn đã được gửi' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền gửi tin nhắn' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy lịch sử tin nhắn của nhóm' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách tin nhắn' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, get_messages_dto_1.GetMessagesDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)('messages/:messageId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết một tin nhắn' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chi tiết tin nhắn' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tin nhắn không tồn tại' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('messageId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessageById", null);
__decorate([
    (0, common_1.Put)('messages/:messageId'),
    (0, swagger_1.ApiOperation)({ summary: 'Sửa tin nhắn' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tin nhắn đã được cập nhật' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền sửa tin nhắn' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('messageId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, update_message_dto_1.UpdateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateMessage", null);
__decorate([
    (0, common_1.Delete)('messages/:messageId'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa tin nhắn' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tin nhắn đã được xóa' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền xóa tin nhắn' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('messageId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Đếm số tin nhắn chưa đọc' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Số tin nhắn chưa đọc' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUnreadCount", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('groups/:groupId/chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map