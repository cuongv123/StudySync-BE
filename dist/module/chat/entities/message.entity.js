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
exports.Message = exports.MessageType = void 0;
const typeorm_1 = require("typeorm");
const group_entity_1 = require("../../group/entities/group.entity");
const User_entity_1 = require("../../User/entities/User.entity");
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["IMAGE"] = "image";
    MessageType["FILE"] = "file";
    MessageType["SYSTEM"] = "system";
})(MessageType || (exports.MessageType = MessageType = {}));
let Message = class Message {
};
exports.Message = Message;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'groupId' }),
    __metadata("design:type", Number)
], Message.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'senderId' }),
    __metadata("design:type", String)
], Message.prototype, "senderId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MessageType,
        default: MessageType.TEXT,
    }),
    __metadata("design:type", String)
], Message.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Message.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'isEdited' }),
    __metadata("design:type", Boolean)
], Message.prototype, "isEdited", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'isDeleted' }),
    __metadata("design:type", Boolean)
], Message.prototype, "isDeleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'deletedAt' }),
    __metadata("design:type", Date)
], Message.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true, name: 'replyToId' }),
    __metadata("design:type", Number)
], Message.prototype, "replyToId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'createdAt' }),
    __metadata("design:type", Date)
], Message.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updatedAt' }),
    __metadata("design:type", Date)
], Message.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => group_entity_1.StudyGroup, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'groupId' }),
    __metadata("design:type", group_entity_1.StudyGroup)
], Message.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'senderId' }),
    __metadata("design:type", User_entity_1.User)
], Message.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Message, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'replyToId' }),
    __metadata("design:type", Message)
], Message.prototype, "replyTo", void 0);
exports.Message = Message = __decorate([
    (0, typeorm_1.Entity)('messages')
], Message);
//# sourceMappingURL=message.entity.js.map