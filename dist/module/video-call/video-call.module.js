"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoCallModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const video_call_service_1 = require("./video-call.service");
const video_call_controller_1 = require("./video-call.controller");
const video_call_gateway_1 = require("./video-call.gateway");
const video_call_entity_1 = require("./entities/video-call.entity");
const call_participant_entity_1 = require("./entities/call-participant.entity");
const group_member_entity_1 = require("../group/entities/group-member.entity");
let VideoCallModule = class VideoCallModule {
};
exports.VideoCallModule = VideoCallModule;
exports.VideoCallModule = VideoCallModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([video_call_entity_1.VideoCall, call_participant_entity_1.CallParticipant, group_member_entity_1.GroupMember]),
        ],
        controllers: [video_call_controller_1.VideoCallController],
        providers: [video_call_service_1.VideoCallService, video_call_gateway_1.VideoCallGateway],
        exports: [video_call_service_1.VideoCallService],
    })
], VideoCallModule);
//# sourceMappingURL=video-call.module.js.map