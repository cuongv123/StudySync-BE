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
exports.Notification = exports.NotificationType = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../User/entities/User.entity");
var NotificationType;
(function (NotificationType) {
    NotificationType["INVITE_RECEIVED"] = "invite_received";
    NotificationType["JOIN_REQUEST"] = "join_request";
    NotificationType["MEMBER_JOINED"] = "member_joined";
    NotificationType["MEMBER_LEFT"] = "member_left";
    NotificationType["MEMBER_REMOVED"] = "member_removed";
    NotificationType["GROUP_UPDATED"] = "group_updated";
    NotificationType["LEADERSHIP_TRANSFERRED"] = "leadership_transferred";
    NotificationType["LEADERSHIP_RECEIVED"] = "leadership_received";
    NotificationType["LEADERSHIP_CHANGED"] = "leadership_changed";
    NotificationType["NEW_MESSAGE"] = "new_message";
    NotificationType["MESSAGE_REPLY"] = "message_reply";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        name: 'notificationType'
    }),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'title' }),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'content' }),
    __metadata("design:type", String)
], Notification.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'isRead',
        default: false
    }),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'userId',
        type: 'uuid'
    }),
    __metadata("design:type", String)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_entity_1.User)
], Notification.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'relatedId',
        type: 'integer',
        nullable: true
    }),
    __metadata("design:type", Number)
], Notification.prototype, "relatedId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'relatedType',
        type: 'varchar',
        length: 50,
        nullable: true
    }),
    __metadata("design:type", String)
], Notification.prototype, "relatedType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'createdAt' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notifications')
], Notification);
//# sourceMappingURL=notification.entity.js.map