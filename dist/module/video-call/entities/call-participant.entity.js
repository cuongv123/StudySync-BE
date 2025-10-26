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
exports.CallParticipant = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../User/entities/User.entity");
const video_call_entity_1 = require("./video-call.entity");
let CallParticipant = class CallParticipant {
};
exports.CallParticipant = CallParticipant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CallParticipant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CallParticipant.prototype, "callId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], CallParticipant.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], CallParticipant.prototype, "peerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], CallParticipant.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], CallParticipant.prototype, "leftAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], CallParticipant.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CallParticipant.prototype, "isMuted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CallParticipant.prototype, "isVideoOff", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => video_call_entity_1.VideoCall, (call) => call.participants),
    (0, typeorm_1.JoinColumn)({ name: 'callId' }),
    __metadata("design:type", video_call_entity_1.VideoCall)
], CallParticipant.prototype, "call", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_entity_1.User)
], CallParticipant.prototype, "user", void 0);
exports.CallParticipant = CallParticipant = __decorate([
    (0, typeorm_1.Entity)('call_participants')
], CallParticipant);
//# sourceMappingURL=call-participant.entity.js.map