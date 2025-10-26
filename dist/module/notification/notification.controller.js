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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("./notification.service");
const notification_dto_1 = require("./dto/notification.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async getNotifications(req, query) {
        return this.notificationService.getNotifications(req.user.id, query);
    }
    async getUnreadCount(req) {
        return this.notificationService.getUnreadCount(req.user.id);
    }
    async markAsRead(req, markAsReadDto) {
        return this.notificationService.markAsRead(req.user.id, markAsReadDto.notificationIds);
    }
    async markAllAsRead(req) {
        return this.notificationService.markAllAsRead(req.user.id);
    }
    async getChatNotifications(req, query) {
        return this.notificationService.getChatNotifications(req.user.id, query);
    }
    async getSystemNotifications(req, query) {
        return this.notificationService.getSystemNotifications(req.user.id, query);
    }
    async getChatUnreadCount(req) {
        return this.notificationService.getChatUnreadCount(req.user.id);
    }
    async getSystemUnreadCount(req) {
        return this.notificationService.getSystemUnreadCount(req.user.id);
    }
    async deleteNotification(req, notificationId) {
        return this.notificationService.deleteNotification(req.user.id, notificationId);
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách thông báo của user' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'isRead', required: false, type: Boolean }),
    (0, swagger_1.ApiQuery)({ name: 'types', required: false, isArray: true }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notification_dto_1.GetNotificationsDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy số lượng thông báo chưa đọc' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)('mark-as-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Đánh dấu thông báo đã đọc' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notification_dto_1.MarkAsReadDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('mark-all-as-read'),
    (0, swagger_1.ApiOperation)({ summary: 'Đánh dấu tất cả thông báo đã đọc' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Get)('chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách chat notifications  💬' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'isRead', required: false, type: Boolean }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notification_dto_1.GetNotificationsDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getChatNotifications", null);
__decorate([
    (0, common_1.Get)('system'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách system notifications  🔔' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'isRead', required: false, type: Boolean }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notification_dto_1.GetNotificationsDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getSystemNotifications", null);
__decorate([
    (0, common_1.Get)('chat/unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Số chat notifications chưa đọc ' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getChatUnreadCount", null);
__decorate([
    (0, common_1.Get)('system/unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Số system notifications chưa đọc ' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getSystemUnreadCount", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa thông báo' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteNotification", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('Notifications'),
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map