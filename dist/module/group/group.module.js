"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const group_controller_1 = require("./group.controller");
const group_service_1 = require("./group.service");
const group_entity_1 = require("./entities/group.entity");
const group_member_entity_1 = require("./entities/group-member.entity");
const group_invitation_entity_1 = require("./entities/group-invitation.entity");
const User_entity_1 = require("../User/entities/User.entity");
const notification_module_1 = require("../notification/notification.module");
let GroupModule = class GroupModule {
};
exports.GroupModule = GroupModule;
exports.GroupModule = GroupModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([group_entity_1.StudyGroup, group_member_entity_1.GroupMember, group_invitation_entity_1.GroupInvitation, User_entity_1.User]),
            notification_module_1.NotificationModule
        ],
        controllers: [group_controller_1.GroupController],
        providers: [group_service_1.GroupService],
        exports: [group_service_1.GroupService],
    })
], GroupModule);
//# sourceMappingURL=group.module.js.map