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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNotificationDto = exports.MarkAsReadDto = exports.GetNotificationsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const notification_entity_1 = require("../entities/notification.entity");
class GetNotificationsDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.GetNotificationsDto = GetNotificationsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Số trang' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GetNotificationsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Số items per page' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GetNotificationsDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Lọc theo trạng thái đã đọc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GetNotificationsDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Lọc theo loại thông báo',
        enum: notification_entity_1.NotificationType,
        isArray: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(notification_entity_1.NotificationType, { each: true }),
    __metadata("design:type", Array)
], GetNotificationsDto.prototype, "types", void 0);
class MarkAsReadDto {
}
exports.MarkAsReadDto = MarkAsReadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Danh sách ID notifications cần đánh dấu đã đọc' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNumber)({}, { each: true }),
    __metadata("design:type", Array)
], MarkAsReadDto.prototype, "notificationIds", void 0);
class CreateNotificationDto {
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Loại thông báo', enum: notification_entity_1.NotificationType }),
    (0, class_validator_1.IsEnum)(notification_entity_1.NotificationType),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tiêu đề thông báo' }),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nội dung thông báo' }),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID người nhận' }),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'ID nhóm liên quan' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateNotificationDto.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'ID user liên quan' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "relatedUserId", void 0);
//# sourceMappingURL=notification.dto.js.map