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
exports.GroupInvitation = exports.InvitationStatus = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../User/entities/User.entity");
const group_entity_1 = require("./group.entity");
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "pending";
    InvitationStatus["ACCEPTED"] = "accepted";
    InvitationStatus["REJECTED"] = "rejected";
    InvitationStatus["EXPIRED"] = "expired";
})(InvitationStatus || (exports.InvitationStatus = InvitationStatus = {}));
let GroupInvitation = class GroupInvitation {
};
exports.GroupInvitation = GroupInvitation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GroupInvitation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'inviteEmail' }),
    __metadata("design:type", String)
], GroupInvitation.prototype, "inviteEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'inviterId' }),
    __metadata("design:type", String)
], GroupInvitation.prototype, "inviterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'groupId' }),
    __metadata("design:type", Number)
], GroupInvitation.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 20,
        default: 'pending',
        name: 'status'
    }),
    __metadata("design:type", String)
], GroupInvitation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'message' }),
    __metadata("design:type", String)
], GroupInvitation.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'invitedAt' }),
    __metadata("design:type", Date)
], GroupInvitation.prototype, "invitedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'respondedAt' }),
    __metadata("design:type", Date)
], GroupInvitation.prototype, "respondedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'expiresAt' }),
    __metadata("design:type", Date)
], GroupInvitation.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'inviterId' }),
    __metadata("design:type", User_entity_1.User)
], GroupInvitation.prototype, "inviter", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => group_entity_1.StudyGroup, group => group.invitations, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'groupId' }),
    __metadata("design:type", group_entity_1.StudyGroup)
], GroupInvitation.prototype, "group", void 0);
exports.GroupInvitation = GroupInvitation = __decorate([
    (0, typeorm_1.Entity)('group_invitations')
], GroupInvitation);
//# sourceMappingURL=group-invitation.entity.js.map