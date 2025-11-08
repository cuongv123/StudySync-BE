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
exports.StudyGroup = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../User/entities/User.entity");
const group_member_entity_1 = require("./group-member.entity");
const group_invitation_entity_1 = require("./group-invitation.entity");
let StudyGroup = class StudyGroup {
};
exports.StudyGroup = StudyGroup;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StudyGroup.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, name: 'groupName' }),
    __metadata("design:type", String)
], StudyGroup.prototype, "groupName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StudyGroup.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], StudyGroup.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'leaderId' }),
    __metadata("design:type", String)
], StudyGroup.prototype, "leaderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 1024, name: 'storageLimitMb' }),
    __metadata("design:type", Number)
], StudyGroup.prototype, "storageLimitMb", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'totalStorageUsedMb' }),
    __metadata("design:type", Number)
], StudyGroup.prototype, "totalStorageUsedMb", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, name: 'isActive' }),
    __metadata("design:type", Boolean)
], StudyGroup.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'createdAt' }),
    __metadata("design:type", Date)
], StudyGroup.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updatedAt' }),
    __metadata("design:type", Date)
], StudyGroup.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'leaderId' }),
    __metadata("design:type", User_entity_1.User)
], StudyGroup.prototype, "leader", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_member_entity_1.GroupMember, groupMember => groupMember.group, { cascade: true }),
    __metadata("design:type", Array)
], StudyGroup.prototype, "members", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_invitation_entity_1.GroupInvitation, invitation => invitation.group, { cascade: true }),
    __metadata("design:type", Array)
], StudyGroup.prototype, "invitations", void 0);
exports.StudyGroup = StudyGroup = __decorate([
    (0, typeorm_1.Entity)('study_groups')
], StudyGroup);
//# sourceMappingURL=group.entity.js.map