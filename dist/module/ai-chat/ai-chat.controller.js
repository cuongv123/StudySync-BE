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
exports.AiChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
const ai_chat_service_1 = require("./ai-chat.service");
const save_history_dto_1 = require("./dto/save-history.dto");
const pagination_dto_1 = require("./dto/pagination.dto");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
let AiChatController = class AiChatController {
    constructor(aiChatService) {
        this.aiChatService = aiChatService;
    }
    async createConversation(req, dto) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.aiChatService.createConversation(userId, dto);
        return {
            data: result,
            statusCode: 201,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async getConversations(req, pagination) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.aiChatService.getConversations(userId, pagination);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async getConversationMessages(req, conversationId, pagination) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.aiChatService.getConversationMessages(userId, conversationId, pagination);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async deleteConversation(req, conversationId) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.aiChatService.deleteConversation(userId, conversationId);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async saveHistory(req, dto) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.aiChatService.saveHistory(userId, dto);
        return {
            data: result,
            statusCode: 201,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async getHistory(req, pagination) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.aiChatService.getHistory(userId, pagination);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async getHistoryById(req, id) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.aiChatService.getHistoryById(userId, id);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async deleteHistory(req, id) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.aiChatService.deleteHistory(userId, id);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async clearHistory(req) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.aiChatService.clearHistory(userId);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async getUsage(req) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.aiChatService.getUsage(userId);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.AiChatController = AiChatController;
__decorate([
    (0, common_1.Post)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new conversation (like "+ Trò chuyện mới" button)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Conversation created successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all conversations (for sidebar list)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated conversations' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:conversationId/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all messages in a conversation' }),
    (0, swagger_1.ApiParam)({ name: 'conversationId', type: String }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns conversation messages' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversation not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('conversationId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "getConversationMessages", null);
__decorate([
    (0, common_1.Delete)('conversations/:conversationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete conversation and all its messages' }),
    (0, swagger_1.ApiParam)({ name: 'conversationId', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Conversation not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('conversationId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('save-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Save AI chat history with conversation support' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'History saved successfully. Returns conversationId for next messages.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Limit reached or validation error' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, save_history_dto_1.SaveHistoryDto]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "saveHistory", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI chat history' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns paginated history' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('history/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI chat history by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns history detail' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'History not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "getHistoryById", null);
__decorate([
    (0, common_1.Delete)('history/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete AI chat history by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'History deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'History not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "deleteHistory", null);
__decorate([
    (0, common_1.Delete)('history/clear/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear all AI chat history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All history cleared successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "clearHistory", null);
__decorate([
    (0, common_1.Get)('usage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI usage statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns usage info' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "getUsage", null);
exports.AiChatController = AiChatController = __decorate([
    (0, swagger_1.ApiTags)('AI Chat'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('ai-chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ai_chat_service_1.AiChatService])
], AiChatController);
//# sourceMappingURL=ai-chat.controller.js.map