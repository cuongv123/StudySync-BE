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
exports.GroupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const group_service_1 = require("./group.service");
const create_group_dto_1 = require("./dto/create-group.dto");
const update_group_dto_1 = require("./dto/update-group.dto");
const invite_member_dto_1 = require("./dto/invite-member.dto");
const member_actions_dto_1 = require("./dto/member-actions.dto");
const respond_invitation_dto_1 = require("./dto/respond-invitation.dto");
const transfer_leadership_dto_1 = require("./dto/transfer-leadership.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
let GroupController = class GroupController {
    constructor(groupService) {
        this.groupService = groupService;
    }
    create(createDto, req) {
        return this.groupService.createGroup(createDto, req.user.id);
    }
    getAllGroups(req) {
        return this.groupService.getAllGroups(req.user.id);
    }
    getMyGroups(req) {
        return this.groupService.getMyGroups(req.user.id);
    }
    async getReceivedInvitations(req) {
        return this.groupService.getGroupInvitations(req.user.id, 'received');
    }
    async getSentInvitations(req) {
        return this.groupService.getGroupInvitations(req.user.id, 'sent');
    }
    getGroupDetail(id, req) {
        return this.groupService.getGroupDetail(id, req.user.id);
    }
    updateGroup(id, updateDto, req) {
        return this.groupService.updateGroup(id, updateDto, req.user.id);
    }
    async inviteMember(groupId, inviteDto, req) {
        return this.groupService.inviteMember(groupId, req.user.id, inviteDto.memberEmail, inviteDto.message);
    }
    async requestJoinGroup(groupId, joinDto, req) {
        return this.groupService.requestJoinGroup(groupId, req.user.id, joinDto.message);
    }
    async getJoinRequests(groupId, req) {
        return this.groupService.getJoinRequests(groupId, req.user.id);
    }
    async approveJoinRequest(requestId, req) {
        return this.groupService.approveJoinRequest(requestId, req.user.id);
    }
    async denyJoinRequest(requestId, req) {
        return this.groupService.denyJoinRequest(requestId, req.user.id);
    }
    async respondToInvitation(invitationId, responseDto, req) {
        return this.groupService.respondToInvitation(invitationId, req.user.id, responseDto.status);
    }
    async getGroupMembers(groupId, req) {
        return this.groupService.getGroupMembers(groupId, req.user.id);
    }
    async removeMember(groupId, userId, req) {
        return this.groupService.removeMember(groupId, req.user.id, userId);
    }
    async transferLeadership(groupId, transferDto, req) {
        return this.groupService.transferLeadership(groupId, req.user.id, transferDto.newLeaderId);
    }
    async leaveGroup(groupId, req) {
        return this.groupService.leaveGroup(groupId, req.user.id);
    }
};
exports.GroupController = GroupController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo nhóm học mới' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_group_dto_1.CreateGroupDto, Object]),
    __metadata("design:returntype", void 0)
], GroupController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tất cả các nhóm trong hệ thống' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GroupController.prototype, "getAllGroups", null);
__decorate([
    (0, common_1.Get)('my-groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách nhóm của tôi' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GroupController.prototype, "getMyGroups", null);
__decorate([
    (0, common_1.Get)('invitations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Xem lời mời đã nhận' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getReceivedInvitations", null);
__decorate([
    (0, common_1.Get)('invitations/sent'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Xem lời mời đã gửi' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getSentInvitations", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết nhóm (chỉ nhóm đã join)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], GroupController.prototype, "getGroupDetail", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin nhóm (Leader only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_group_dto_1.UpdateGroupDto, Object]),
    __metadata("design:returntype", void 0)
], GroupController.prototype, "updateGroup", null);
__decorate([
    (0, common_1.Post)(':id/invite'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Mời thành viên vào nhóm' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, invite_member_dto_1.InviteMemberDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "inviteMember", null);
__decorate([
    (0, common_1.Post)(':id/join-request'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Xin gia nhập nhóm' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, member_actions_dto_1.JoinGroupRequestDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "requestJoinGroup", null);
__decorate([
    (0, common_1.Get)(':id/join-requests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Xem danh sách yêu cầu gia nhập nhóm (Leader only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getJoinRequests", null);
__decorate([
    (0, common_1.Post)('join-requests/:requestId/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Duyệt yêu cầu gia nhập nhóm (Leader only)' }),
    __param(0, (0, common_1.Param)('requestId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "approveJoinRequest", null);
__decorate([
    (0, common_1.Post)('join-requests/:requestId/deny'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Từ chối yêu cầu gia nhập nhóm (Leader only)' }),
    __param(0, (0, common_1.Param)('requestId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "denyJoinRequest", null);
__decorate([
    (0, common_1.Post)('invitations/:invitationId/respond'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Phản hồi lời mời' }),
    __param(0, (0, common_1.Param)('invitationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, respond_invitation_dto_1.RespondInvitationDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "respondToInvitation", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách thành viên nhóm' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getGroupMembers", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Đuổi thành viên khỏi nhóm (Leader only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)(':id/transfer-leadership'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Chuyển giao quyền leader cho thành viên khác (Leader only)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, transfer_leadership_dto_1.TransferLeadershipDto, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "transferLeadership", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Rời khỏi nhóm' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "leaveGroup", null);
exports.GroupController = GroupController = __decorate([
    (0, swagger_1.ApiTags)('Study Groups'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)("groups"),
    __metadata("design:paramtypes", [group_service_1.GroupService])
], GroupController);
//# sourceMappingURL=group.controller.js.map