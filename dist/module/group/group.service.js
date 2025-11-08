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
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_1 = require("@nestjs/schedule");
const group_entity_1 = require("./entities/group.entity");
const group_member_entity_1 = require("./entities/group-member.entity");
const group_invitation_entity_1 = require("./entities/group-invitation.entity");
const User_entity_1 = require("../User/entities/User.entity");
const notification_service_1 = require("../notification/notification.service");
const notification_entity_1 = require("../notification/entities/notification.entity");
let GroupService = class GroupService {
    constructor(groupRepository, memberRepository, invitationRepository, userRepository, dataSource, notificationService) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
        this.notificationService = notificationService;
    }
    async createGroup(createDto, userId) {
        const group = this.groupRepository.create(Object.assign(Object.assign({}, createDto), { leaderId: userId }));
        const savedGroup = await this.groupRepository.save(group);
        const leaderMember = this.memberRepository.create({
            userId: userId,
            groupId: savedGroup.id,
            role: group_member_entity_1.MemberRole.LEADER,
        });
        await this.memberRepository.save(leaderMember);
        return savedGroup;
    }
    async getMyGroups(userId) {
        const groups = await this.groupRepository
            .createQueryBuilder('group')
            .innerJoin('group.members', 'member')
            .where('member.userId = :userId', { userId })
            .getMany();
        return groups;
    }
    async getAllGroups(userId) {
        const groups = await this.groupRepository
            .createQueryBuilder('group')
            .leftJoinAndSelect('group.leader', 'leader')
            .loadRelationCountAndMap('group.memberCount', 'group.members')
            .where('group.isActive = :isActive', { isActive: true })
            .orderBy('group.createdAt', 'DESC')
            .getMany();
        const userMemberships = await this.memberRepository.find({
            where: { userId },
            select: ['groupId'],
        });
        const joinedGroupIds = new Set(userMemberships.map(m => m.groupId));
        const groupsWithMemberStatus = groups.map(group => (Object.assign(Object.assign({}, group), { isMember: joinedGroupIds.has(group.id) })));
        return groupsWithMemberStatus;
    }
    async getGroupDetail(id, userId) {
        const group = await this.groupRepository.findOne({
            where: { id },
            relations: ['leader', 'members', 'members.user'],
        });
        if (!group) {
            throw new common_1.NotFoundException('Nhóm không tồn tại');
        }
        const isMember = group.members.some(member => member.userId === userId);
        if (!isMember) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem nhóm này');
        }
        return group;
    }
    async updateGroup(id, updateDto, userId) {
        const group = await this.groupRepository.findOne({ where: { id } });
        if (!group) {
            throw new common_1.NotFoundException('Nhóm không tồn tại');
        }
        if (group.leaderId !== userId) {
            throw new common_1.ForbiddenException('Chỉ leader mới có thể cập nhật nhóm');
        }
        await this.groupRepository.update(id, updateDto);
        return this.groupRepository.findOne({ where: { id } });
    }
    async deleteGroup(id, userId) {
        const group = await this.groupRepository.findOne({ where: { id } });
        if (!group) {
            throw new common_1.NotFoundException('Nhóm không tồn tại');
        }
        if (group.leaderId !== userId) {
            throw new common_1.ForbiddenException('Chỉ leader mới có thể xóa nhóm');
        }
        await this.groupRepository.remove(group);
        return { message: 'Xóa nhóm thành công' };
    }
    async getGroupMembersWithRoles(groupId, userId) {
        const membership = await this.memberRepository.findOne({
            where: { groupId, userId }
        });
        if (!membership) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem danh sách thành viên');
        }
        const members = await this.memberRepository
            .createQueryBuilder('member')
            .leftJoinAndSelect('member.user', 'user')
            .where('member.groupId = :groupId', { groupId })
            .orderBy('CASE member.role WHEN :leader THEN 1 ELSE 2 END', 'ASC')
            .addOrderBy('member.joinedAt', 'ASC')
            .setParameters({
            leader: group_member_entity_1.MemberRole.LEADER
        })
            .getMany();
        return members.map(member => {
            var _a, _b;
            return ({
                userId: member.userId,
                username: (_a = member.user) === null || _a === void 0 ? void 0 : _a.username,
                email: (_b = member.user) === null || _b === void 0 ? void 0 : _b.email,
                role: member.role,
                joinedAt: member.joinedAt
            });
        });
    }
    async inviteMember(groupId, leaderId, memberEmail, message) {
        const leader = await this.memberRepository.findOne({
            where: { groupId, userId: leaderId, role: group_member_entity_1.MemberRole.LEADER }
        });
        if (!leader) {
            throw new common_1.ForbiddenException('Chỉ leader mới có thể mời thành viên');
        }
        const memberCount = await this.memberRepository.count({
            where: { groupId }
        });
        if (memberCount >= 6) {
            throw new common_1.ForbiddenException('Nhóm đã đạt số lượng thành viên tối đa (6 người)');
        }
        const invitedUser = await this.userRepository.findOne({
            where: { email: memberEmail, isVerified: true }
        });
        if (!invitedUser) {
            throw new common_1.NotFoundException('Không tìm thấy user với email này hoặc user chưa xác thực');
        }
        const existingMember = await this.memberRepository.findOne({
            where: { groupId, userId: invitedUser.id }
        });
        if (existingMember) {
            throw new common_1.ForbiddenException('User này đã là thành viên của nhóm');
        }
        const existingInvitation = await this.invitationRepository.findOne({
            where: {
                groupId,
                inviteEmail: memberEmail,
                status: group_invitation_entity_1.InvitationStatus.PENDING
            }
        });
        if (existingInvitation) {
            throw new common_1.ForbiddenException('Lời mời cho email này đã được gửi trước đó');
        }
        const invitation = this.invitationRepository.create({
            groupId,
            inviteEmail: memberEmail,
            inviterId: leaderId,
            message: message,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        const savedInvitation = await this.invitationRepository.save(invitation);
        const group = await this.groupRepository.findOne({
            where: { id: groupId }
        });
        const leaderUser = await this.userRepository.findOne({
            where: { id: leaderId }
        });
        await this.notificationService.createInviteNotification(invitedUser.id, leaderUser.username, group.groupName, groupId, leaderId);
        return {
            message: `Đã gửi lời mời đến ${invitedUser.username} (${invitedUser.email})`,
            invitationId: savedInvitation.id
        };
    }
    async requestJoinGroup(groupId, userId, message) {
        const group = await this.groupRepository.findOne({
            where: { id: groupId, isActive: true }
        });
        if (!group) {
            throw new common_1.NotFoundException('Không tìm thấy nhóm hoặc nhóm đã bị khóa');
        }
        const memberCount = await this.memberRepository.count({
            where: { groupId }
        });
        if (memberCount >= 6) {
            throw new common_1.ForbiddenException('Nhóm đã đầy (6/6 thành viên)');
        }
        const existingMember = await this.memberRepository.findOne({
            where: { groupId, userId }
        });
        if (existingMember) {
            throw new common_1.ForbiddenException('Bạn đã là thành viên của nhóm này');
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User không tồn tại');
        }
        const existingRequest = await this.invitationRepository.findOne({
            where: {
                groupId,
                inviteEmail: user.email,
                status: group_invitation_entity_1.InvitationStatus.PENDING
            }
        });
        if (existingRequest) {
            throw new common_1.ForbiddenException('Bạn đã gửi yêu cầu gia nhập trước đó');
        }
        const joinRequest = this.invitationRepository.create({
            groupId,
            inviteEmail: user.email,
            inviterId: userId,
            message: message,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        const savedRequest = await this.invitationRepository.save(joinRequest);
        const requester = await this.userRepository.findOne({
            where: { id: userId }
        });
        await this.notificationService.createJoinRequestNotification(group.leaderId, requester.username, group.groupName, groupId, userId);
        return {
            message: 'Đã gửi yêu cầu gia nhập nhóm. Chờ leader phê duyệt.',
            requestId: savedRequest.id
        };
    }
    async respondToInvitation(invitationId, userId, response) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User không tồn tại');
        }
        const invitation = await this.invitationRepository.findOne({
            where: { id: invitationId, inviteEmail: user.email, status: group_invitation_entity_1.InvitationStatus.PENDING },
            relations: ['group']
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Không tìm thấy lời mời hoặc lời mời đã được xử lý');
        }
        invitation.status = response;
        await this.invitationRepository.save(invitation);
        if (response === group_invitation_entity_1.InvitationStatus.ACCEPTED) {
            const memberCount = await this.memberRepository.count({
                where: { groupId: invitation.groupId }
            });
            if (memberCount >= 6) {
                invitation.status = group_invitation_entity_1.InvitationStatus.REJECTED;
                await this.invitationRepository.save(invitation);
                throw new common_1.ForbiddenException('Nhóm đã đầy, không thể tham gia');
            }
            const member = this.memberRepository.create({
                groupId: invitation.groupId,
                userId: userId,
                role: group_member_entity_1.MemberRole.MEMBER,
            });
            await this.memberRepository.save(member);
            const allMembers = await this.memberRepository.find({
                where: { groupId: invitation.groupId },
                select: ['userId']
            });
            const memberIds = allMembers.map(m => m.userId);
            const newMember = await this.userRepository.findOne({
                where: { id: userId }
            });
            await this.notificationService.createMemberJoinedNotification(memberIds, newMember.username, invitation.group.groupName, invitation.groupId, userId);
            return {
                message: `Đã tham gia nhóm "${invitation.group.groupName}" thành công`,
                groupId: invitation.groupId
            };
        }
        else {
            return {
                message: 'Đã từ chối lời mời gia nhập nhóm'
            };
        }
    }
    async removeMember(groupId, leaderId, memberUserId) {
        var _a, _b;
        const leader = await this.memberRepository.findOne({
            where: { groupId, userId: leaderId, role: group_member_entity_1.MemberRole.LEADER }
        });
        if (!leader) {
            throw new common_1.ForbiddenException('Chỉ leader mới có thể kick thành viên');
        }
        if (memberUserId === leaderId) {
            throw new common_1.ForbiddenException('Leader không thể tự kick chính mình');
        }
        const member = await this.memberRepository.findOne({
            where: { groupId, userId: memberUserId },
            relations: ['user']
        });
        if (!member) {
            throw new common_1.NotFoundException('Không tìm thấy thành viên trong nhóm');
        }
        await this.memberRepository.remove(member);
        const group = await this.groupRepository.findOne({
            where: { id: groupId }
        });
        const remainingMembers = await this.memberRepository.find({
            where: { groupId },
            select: ['userId']
        });
        const remainingMemberIds = remainingMembers.map(m => m.userId);
        if (remainingMemberIds.length > 0) {
            await this.notificationService.createMemberLeftNotification(remainingMemberIds, ((_a = member.user) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown user', group.groupName, groupId, memberUserId);
        }
        return {
            message: `Đã kick ${(_b = member.user) === null || _b === void 0 ? void 0 : _b.username} khỏi nhóm`,
            removedUserId: memberUserId
        };
    }
    async leaveGroup(groupId, userId) {
        const member = await this.memberRepository.findOne({
            where: { groupId, userId },
            relations: ['group']
        });
        if (!member) {
            throw new common_1.NotFoundException('Bạn không phải thành viên của nhóm này');
        }
        if (member.role === group_member_entity_1.MemberRole.LEADER) {
            const memberCount = await this.memberRepository.count({
                where: { groupId }
            });
            if (memberCount > 1) {
                throw new common_1.ForbiddenException('Leader phải chuyển quyền lãnh đạo trước khi rời nhóm');
            }
        }
        await this.memberRepository.remove(member);
        if (member.role === group_member_entity_1.MemberRole.LEADER) {
            await this.groupRepository.update({ id: groupId }, { isActive: false });
        }
        else {
            const remainingMembers = await this.memberRepository.find({
                where: { groupId },
                select: ['userId']
            });
            const remainingMemberIds = remainingMembers.map(m => m.userId);
            const leavingUser = await this.userRepository.findOne({
                where: { id: userId }
            });
            if (remainingMemberIds.length > 0) {
                await this.notificationService.createMemberLeftNotification(remainingMemberIds, leavingUser.username, member.group.groupName, groupId, userId);
            }
        }
        return {
            message: `Đã rời khỏi nhóm "${member.group.groupName}"`,
            groupId: groupId
        };
    }
    async getGroupInvitations(userId, type = 'received') {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User không tồn tại');
        }
        const whereCondition = type === 'received'
            ? { inviteEmail: user.email, status: group_invitation_entity_1.InvitationStatus.PENDING }
            : { inviterId: userId };
        const invitations = await this.invitationRepository.find({
            where: whereCondition,
            order: { invitedAt: 'DESC' }
        });
        const results = [];
        for (const inv of invitations) {
            const group = await this.groupRepository.findOne({ where: { id: inv.groupId } });
            const inviter = await this.userRepository.findOne({ where: { id: inv.inviterId } });
            results.push({
                id: inv.id,
                groupName: (group === null || group === void 0 ? void 0 : group.groupName) || 'Unknown Group',
                groupDescription: (group === null || group === void 0 ? void 0 : group.description) || '',
                status: inv.status,
                invitedBy: (inviter === null || inviter === void 0 ? void 0 : inviter.username) || 'Unknown User',
                inviteEmail: inv.inviteEmail,
                invitedAt: inv.invitedAt
            });
        }
        return results;
    }
    async getJoinRequests(groupId, leaderId) {
        const group = await this.groupRepository.findOne({
            where: { id: groupId }
        });
        if (!group) {
            throw new common_1.NotFoundException('Nhóm không tồn tại');
        }
        if (group.leaderId !== leaderId) {
            throw new common_1.ForbiddenException('Chỉ leader mới có thể xem danh sách yêu cầu gia nhập');
        }
        const joinRequests = await this.invitationRepository.find({
            where: {
                groupId,
                status: group_invitation_entity_1.InvitationStatus.PENDING
            },
            order: { invitedAt: 'DESC' }
        });
        const results = [];
        for (const request of joinRequests) {
            const user = await this.userRepository.findOne({
                where: { email: request.inviteEmail }
            });
            if (user && request.inviterId === user.id) {
                results.push({
                    id: request.id,
                    groupId: request.groupId,
                    groupName: group.groupName,
                    requesterName: user.username,
                    requesterEmail: user.email,
                    requesterId: user.id,
                    requestedAt: request.invitedAt,
                    status: request.status,
                    message: request.message
                });
            }
        }
        return results;
    }
    async approveJoinRequest(requestId, leaderId) {
        const joinRequest = await this.invitationRepository.findOne({
            where: { id: requestId, status: group_invitation_entity_1.InvitationStatus.PENDING }
        });
        if (!joinRequest) {
            throw new common_1.NotFoundException('Yêu cầu gia nhập không tồn tại hoặc đã được xử lý');
        }
        const group = await this.groupRepository.findOne({
            where: { id: joinRequest.groupId }
        });
        if (!group || group.leaderId !== leaderId) {
            throw new common_1.ForbiddenException('Chỉ leader mới có thể duyệt yêu cầu gia nhập');
        }
        const requester = await this.userRepository.findOne({
            where: { email: joinRequest.inviteEmail }
        });
        if (!requester) {
            throw new common_1.NotFoundException('Người dùng không tồn tại');
        }
        const existingMember = await this.memberRepository.findOne({
            where: { groupId: joinRequest.groupId, userId: requester.id }
        });
        if (existingMember) {
            throw new common_1.ForbiddenException('Người dùng đã là thành viên của nhóm');
        }
        const newMember = this.memberRepository.create({
            groupId: joinRequest.groupId,
            userId: requester.id,
            role: group_member_entity_1.MemberRole.MEMBER
        });
        await this.memberRepository.save(newMember);
        joinRequest.status = group_invitation_entity_1.InvitationStatus.ACCEPTED;
        joinRequest.respondedAt = new Date();
        await this.invitationRepository.save(joinRequest);
        await this.notificationService.createNotification({
            type: notification_entity_1.NotificationType.MEMBER_JOINED,
            title: 'Yêu cầu gia nhập được chấp nhận',
            message: `Yêu cầu gia nhập nhóm "${group.groupName}" của bạn đã được chấp nhận`,
            userId: requester.id,
            groupId: group.id,
            relatedUserId: leaderId,
        });
        const members = await this.memberRepository.find({
            where: { groupId: joinRequest.groupId },
            relations: ['user']
        });
        const memberIds = members.map(m => m.userId).filter(id => id !== requester.id);
        if (memberIds.length > 0) {
            await this.notificationService.createMemberJoinedNotification(memberIds, requester.username, group.groupName, group.id, requester.id);
        }
        return {
            message: `Đã duyệt yêu cầu gia nhập của ${requester.username}`,
            newMember: {
                id: requester.id,
                username: requester.username,
                email: requester.email,
                role: 'member'
            }
        };
    }
    async denyJoinRequest(requestId, leaderId) {
        const joinRequest = await this.invitationRepository.findOne({
            where: { id: requestId, status: group_invitation_entity_1.InvitationStatus.PENDING }
        });
        if (!joinRequest) {
            throw new common_1.NotFoundException('Yêu cầu gia nhập không tồn tại hoặc đã được xử lý');
        }
        const group = await this.groupRepository.findOne({
            where: { id: joinRequest.groupId }
        });
        if (!group || group.leaderId !== leaderId) {
            throw new common_1.ForbiddenException('Chỉ leader mới có thể từ chối yêu cầu gia nhập');
        }
        const requester = await this.userRepository.findOne({
            where: { email: joinRequest.inviteEmail }
        });
        if (!requester) {
            throw new common_1.NotFoundException('Người dùng không tồn tại');
        }
        joinRequest.status = group_invitation_entity_1.InvitationStatus.REJECTED;
        joinRequest.respondedAt = new Date();
        await this.invitationRepository.save(joinRequest);
        await this.notificationService.createNotification({
            type: notification_entity_1.NotificationType.JOIN_REQUEST,
            title: 'Yêu cầu gia nhập bị từ chối',
            message: `Yêu cầu gia nhập nhóm "${group.groupName}" của bạn đã bị từ chối`,
            userId: requester.id,
            groupId: group.id,
            relatedUserId: leaderId,
        });
        return {
            message: `Đã từ chối yêu cầu gia nhập của ${requester.username}`,
            requester: {
                id: requester.id,
                username: requester.username,
                email: requester.email
            }
        };
    }
    async getGroupMembers(groupId, userId) {
        const membership = await this.memberRepository.findOne({
            where: { groupId, userId },
            relations: ['group']
        });
        if (!membership) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem danh sách thành viên của nhóm này');
        }
        const members = await this.memberRepository.find({
            where: { groupId },
            relations: ['user'],
            order: { joinedAt: 'ASC' }
        });
        return {
            groupId,
            groupName: membership.group.groupName,
            members: members.map(member => ({
                id: member.user.id,
                username: member.user.username,
                email: member.user.email,
                role: member.role,
                joinedAt: member.joinedAt,
                isLeader: member.user.id === membership.group.leaderId
            }))
        };
    }
    async transferLeadership(groupId, currentLeaderId, newLeaderId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const group = await queryRunner.manager.findOne(group_entity_1.StudyGroup, {
                where: { id: groupId }
            });
            if (!group) {
                throw new common_1.NotFoundException('Nhóm không tồn tại');
            }
            if (group.leaderId !== currentLeaderId) {
                throw new common_1.ForbiddenException('Chỉ leader hiện tại mới có quyền chuyển giao');
            }
            const newLeaderMember = await queryRunner.manager.findOne(group_member_entity_1.GroupMember, {
                where: {
                    userId: newLeaderId,
                    groupId: groupId,
                    role: group_member_entity_1.MemberRole.MEMBER
                },
                relations: ['user']
            });
            if (!newLeaderMember) {
                throw new common_1.NotFoundException('Member được chọn không tồn tại trong nhóm hoặc đã là leader');
            }
            if (currentLeaderId === newLeaderId) {
                throw new common_1.ForbiddenException('Không thể tự chuyển giao quyền leader cho chính mình');
            }
            await queryRunner.manager.update(group_entity_1.StudyGroup, groupId, {
                leaderId: newLeaderId
            });
            await queryRunner.manager.update(group_member_entity_1.GroupMember, {
                userId: currentLeaderId,
                groupId: groupId
            }, {
                role: group_member_entity_1.MemberRole.MEMBER
            });
            await queryRunner.manager.update(group_member_entity_1.GroupMember, {
                userId: newLeaderId,
                groupId: groupId
            }, {
                role: group_member_entity_1.MemberRole.LEADER
            });
            const oldLeader = await this.userRepository.findOne({
                where: { id: currentLeaderId }
            });
            const newLeader = newLeaderMember.user;
            const allMembers = await queryRunner.manager.find(group_member_entity_1.GroupMember, {
                where: { groupId: groupId },
                relations: ['user']
            });
            await queryRunner.commitTransaction();
            await this.notificationService.createNotification({
                userId: currentLeaderId,
                type: notification_entity_1.NotificationType.LEADERSHIP_TRANSFERRED,
                title: 'Đã chuyển giao quyền leader',
                message: `Bạn đã chuyển giao quyền leader của nhóm "${group.groupName}" cho ${newLeader.username}`,
                groupId: groupId,
                relatedUserId: newLeaderId.toString()
            });
            await this.notificationService.createNotification({
                userId: newLeaderId,
                type: notification_entity_1.NotificationType.LEADERSHIP_RECEIVED,
                title: 'Được bổ nhiệm làm leader',
                message: `Bạn đã được ${oldLeader.username} bổ nhiệm làm leader của nhóm "${group.groupName}"`,
                groupId: groupId,
                relatedUserId: currentLeaderId
            });
            for (const member of allMembers) {
                const memberId = member.userId;
                if (memberId !== currentLeaderId && memberId !== newLeaderId) {
                    await this.notificationService.createNotification({
                        userId: memberId,
                        type: notification_entity_1.NotificationType.LEADERSHIP_CHANGED,
                        title: 'Thay đổi leader nhóm',
                        message: `${oldLeader.username} đã chuyển giao quyền leader cho ${newLeader.username} trong nhóm "${group.groupName}"`,
                        groupId: groupId
                    });
                }
            }
            return {
                message: 'Chuyển giao quyền leader thành công',
                oldLeader: {
                    id: oldLeader.id,
                    username: oldLeader.username
                },
                newLeader: {
                    id: newLeader.id,
                    username: newLeader.username
                },
                group: {
                    id: group.id,
                    groupName: group.groupName
                }
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async expireOldInvitations() {
        const now = new Date();
        const expiredInvitations = await this.invitationRepository.find({
            where: {
                status: group_invitation_entity_1.InvitationStatus.PENDING,
                expiresAt: (0, typeorm_2.LessThan)(now),
            },
        });
        if (expiredInvitations.length > 0) {
            await this.invitationRepository.update({
                status: group_invitation_entity_1.InvitationStatus.PENDING,
                expiresAt: (0, typeorm_2.LessThan)(now),
            }, { status: group_invitation_entity_1.InvitationStatus.EXPIRED });
            console.log(`[CRON] Expired ${expiredInvitations.length} invitation(s):`, expiredInvitations.map((inv) => inv.id).join(', '));
        }
    }
};
exports.GroupService = GroupService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GroupService.prototype, "expireOldInvitations", null);
exports.GroupService = GroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_entity_1.StudyGroup)),
    __param(1, (0, typeorm_1.InjectRepository)(group_member_entity_1.GroupMember)),
    __param(2, (0, typeorm_1.InjectRepository)(group_invitation_entity_1.GroupInvitation)),
    __param(3, (0, typeorm_1.InjectRepository)(User_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        notification_service_1.NotificationService])
], GroupService);
//# sourceMappingURL=group.service.js.map