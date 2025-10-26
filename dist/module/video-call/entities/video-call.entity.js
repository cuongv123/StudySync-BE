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
exports.VideoCall = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../User/entities/User.entity");
const group_entity_1 = require("../../group/entities/group.entity");
const call_participant_entity_1 = require("./call-participant.entity");
const call_status_enum_1 = require("../../../common/enums/call-status.enum");
let VideoCall = class VideoCall {
};
exports.VideoCall = VideoCall;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VideoCall.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], VideoCall.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], VideoCall.prototype, "callTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], VideoCall.prototype, "startedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: call_status_enum_1.CallStatus,
        default: call_status_enum_1.CallStatus.WAITING,
    }),
    __metadata("design:type", String)
], VideoCall.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], VideoCall.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VideoCall.prototype, "endedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VideoCall.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VideoCall.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => group_entity_1.StudyGroup, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'groupId' }),
    __metadata("design:type", group_entity_1.StudyGroup)
], VideoCall.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'startedBy' }),
    __metadata("design:type", User_entity_1.User)
], VideoCall.prototype, "starter", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => call_participant_entity_1.CallParticipant, (participant) => participant.call),
    __metadata("design:type", Array)
], VideoCall.prototype, "participants", void 0);
exports.VideoCall = VideoCall = __decorate([
    (0, typeorm_1.Entity)('video_calls')
], VideoCall);
//# sourceMappingURL=video-call.entity.js.map