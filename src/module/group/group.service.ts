import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StudyGroup } from './entities/group.entity';
import { GroupMember, MemberRole } from './entities/group-member.entity';
import { GroupInvitation, InvitationStatus } from './entities/group-invitation.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { User } from '../User/entities/User.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/entities/notification.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(StudyGroup)
    private groupRepository: Repository<StudyGroup>,
    @InjectRepository(GroupMember)
    private memberRepository: Repository<GroupMember>,
    @InjectRepository(GroupInvitation)
    private invitationRepository: Repository<GroupInvitation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private notificationService: NotificationService,
  ) {}

  async createGroup(createDto: CreateGroupDto, userId: string) {
    // Tạo nhóm mới
    const group = this.groupRepository.create({
      ...createDto,
      leaderId: userId,
    });
    
    const savedGroup = await this.groupRepository.save(group);

    // Thêm leader vào danh sách thành viên
    const leaderMember = this.memberRepository.create({
      userId: userId,
      groupId: savedGroup.id,
      role: MemberRole.LEADER, // Người tạo nhóm = Leader
    });
    
    await this.memberRepository.save(leaderMember);

    return savedGroup;
  }

  async getMyGroups(userId: string) {
    const groups = await this.groupRepository
      .createQueryBuilder('group')
      .innerJoin('group.members', 'member')
      .where('member.userId = :userId', { userId })
      .getMany();

    return groups;
  }

  async getAllGroups(userId: string) {
    // Lấy tất cả các nhóm với thông tin leader và số lượng thành viên
    const groups = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.leader', 'leader')
      .loadRelationCountAndMap('group.memberCount', 'group.members')
      .where('group.isActive = :isActive', { isActive: true })
      .orderBy('group.createdAt', 'DESC')
      .getMany();

    // Kiểm tra user đã join nhóm nào chưa
    const userMemberships = await this.memberRepository.find({
      where: { userId },
      select: ['groupId'],
    });
    const joinedGroupIds = new Set(userMemberships.map(m => m.groupId));

    // Thêm thông tin isMember cho mỗi nhóm
    const groupsWithMemberStatus = groups.map(group => ({
      ...group,
      isMember: joinedGroupIds.has(group.id),
    }));

    return groupsWithMemberStatus;
  }

  async getGroupDetail(id: number, userId: string) {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['leader', 'members', 'members.user'],
    });

    if (!group) {
      throw new NotFoundException('Nhóm không tồn tại');
    }

    // Kiểm tra user có trong nhóm không
    const isMember = group.members.some(member => member.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không có quyền xem nhóm này');
    }

    return group;
  }

  async updateGroup(id: number, updateDto: UpdateGroupDto, userId: string) {
    const group = await this.groupRepository.findOne({ where: { id } });
    
    if (!group) {
      throw new NotFoundException('Nhóm không tồn tại');
    }

    if (group.leaderId !== userId) {
      throw new ForbiddenException('Chỉ leader mới có thể cập nhật nhóm');
    }

    await this.groupRepository.update(id, updateDto);
    return this.groupRepository.findOne({ where: { id } });
  }

  async deleteGroup(id: number, userId: string) {
    const group = await this.groupRepository.findOne({ where: { id } });
    
    if (!group) {
      throw new NotFoundException('Nhóm không tồn tại');
    }

    if (group.leaderId !== userId) {
      throw new ForbiddenException('Chỉ leader mới có thể xóa nhóm');
    }

    await this.groupRepository.remove(group);
    return { message: 'Xóa nhóm thành công' };
  }

  // =================== ROLE & MEMBER MANAGEMENT ===================
  // Role Management Methods

  // Không cần promote/demote methods cho nhóm nhỏ
  // Chỉ có 2 role: Leader và Member

  async getGroupMembersWithRoles(groupId: number, userId: string) {
    // Verify user is member of group
    const membership = await this.memberRepository.findOne({
      where: { groupId, userId }
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không có quyền xem danh sách thành viên');
    }

    // Get all members with their roles
    const members = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .where('member.groupId = :groupId', { groupId })
      .orderBy('CASE member.role WHEN :leader THEN 1 ELSE 2 END', 'ASC')
      .addOrderBy('member.joinedAt', 'ASC')
      .setParameters({ 
        leader: MemberRole.LEADER
      })
      .getMany();

    return members.map(member => ({
      userId: member.userId,
      username: member.user?.username,
      email: member.user?.email,
      role: member.role,
      joinedAt: member.joinedAt
    }));
  }

  // =================== MEMBER MANAGEMENT METHODS ===================

  async inviteMember(groupId: number, leaderId: string, memberEmail: string, message?: string) {
    // 1. Verify leader permissions
    const leader = await this.memberRepository.findOne({
      where: { groupId, userId: leaderId, role: MemberRole.LEADER }
    });

    if (!leader) {
      throw new ForbiddenException('Chỉ leader mới có thể mời thành viên');
    }

    // 2. Check group member limit (6 người tối đa)
    const memberCount = await this.memberRepository.count({
      where: { groupId }
    });

    if (memberCount >= 6) {
      throw new ForbiddenException('Nhóm đã đạt số lượng thành viên tối đa (6 người)');
    }

    // 3. Find user by email (must be verified)
    const invitedUser = await this.userRepository.findOne({
      where: { email: memberEmail, isVerified: true }
    });

    if (!invitedUser) {
      throw new NotFoundException('Không tìm thấy user với email này hoặc user chưa xác thực');
    }

    // 4. Check if user is already a member
    const existingMember = await this.memberRepository.findOne({
      where: { groupId, userId: invitedUser.id }
    });

    if (existingMember) {
      throw new ForbiddenException('User này đã là thành viên của nhóm');
    }

    // 5. Check if invitation already exists
    const existingInvitation = await this.invitationRepository.findOne({
      where: { 
        groupId, 
        inviteEmail: memberEmail, 
        status: InvitationStatus.PENDING 
      }
    });

    if (existingInvitation) {
      throw new ForbiddenException('Lời mời cho email này đã được gửi trước đó');
    }

    // 6. Create invitation
    const invitation = this.invitationRepository.create({
      groupId,
      inviteEmail: memberEmail,
      inviterId: leaderId,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    // 7. Get group info and leader info for notification
    const group = await this.groupRepository.findOne({
      where: { id: groupId }
    });
    const leaderUser = await this.userRepository.findOne({
      where: { id: leaderId }
    });

    // 8. Send notification to invited user
    await this.notificationService.createInviteNotification(
      invitedUser.id,
      leaderUser.username,
      group.groupName,
      groupId,
      leaderId
    );

    return {
      message: `Đã gửi lời mời đến ${invitedUser.username} (${invitedUser.email})`,
      invitationId: savedInvitation.id
    };
  }

  async requestJoinGroup(groupId: number, userId: string, message?: string) {
    // 1. Check if group exists and is active
    const group = await this.groupRepository.findOne({
      where: { id: groupId, isActive: true }
    });

    if (!group) {
      throw new NotFoundException('Không tìm thấy nhóm hoặc nhóm đã bị khóa');
    }

    // 2. Check group member limit
    const memberCount = await this.memberRepository.count({
      where: { groupId }
    });

    if (memberCount >= 6) {
      throw new ForbiddenException('Nhóm đã đầy (6/6 thành viên)');
    }

    // 3. Check if user is already a member
    const existingMember = await this.memberRepository.findOne({
      where: { groupId, userId }
    });

    if (existingMember) {
      throw new ForbiddenException('Bạn đã là thành viên của nhóm này');
    }

    // 4. Get user email
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // 5. Check if request already exists
    const existingRequest = await this.invitationRepository.findOne({
      where: { 
        groupId, 
        inviteEmail: user.email, 
        status: InvitationStatus.PENDING 
      }
    });

    if (existingRequest) {
      throw new ForbiddenException('Bạn đã gửi yêu cầu gia nhập trước đó');
    }

    // 6. Create join request (invitation from user to group)
    const joinRequest = this.invitationRepository.create({
      groupId,
      inviteEmail: user.email, 
      inviterId: userId, // User tự gửi request
    });

    const savedRequest = await this.invitationRepository.save(joinRequest);

    // 6. Get user info and group info for notification
    const requester = await this.userRepository.findOne({
      where: { id: userId }
    });

    // 7. Send notification to group leader
    await this.notificationService.createJoinRequestNotification(
      group.leaderId,
      requester.username,
      group.groupName,
      groupId,
      userId
    );

    return {
      message: 'Đã gửi yêu cầu gia nhập nhóm. Chờ leader phê duyệt.',
      requestId: savedRequest.id
    };
  }

  async respondToInvitation(invitationId: number, userId: string, response: InvitationStatus) {
    // 1. Get user email
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // 2. Find invitation  
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId, inviteEmail: user.email, status: InvitationStatus.PENDING },
      relations: ['group']
    });

    if (!invitation) {
      throw new NotFoundException('Không tìm thấy lời mời hoặc lời mời đã được xử lý');
    }

    // 2. Update invitation status
    invitation.status = response;
    await this.invitationRepository.save(invitation);

    if (response === InvitationStatus.ACCEPTED) {
      // 3. Check group member limit again
      const memberCount = await this.memberRepository.count({
        where: { groupId: invitation.groupId }
      });

      if (memberCount >= 6) {
        // Revert invitation if group is full
        invitation.status = InvitationStatus.DECLINED;
        await this.invitationRepository.save(invitation);
        throw new ForbiddenException('Nhóm đã đầy, không thể tham gia');
      }

      // 4. Add user to group as member
      const member = this.memberRepository.create({
        groupId: invitation.groupId,
        userId: userId,
        role: MemberRole.MEMBER,
      });

      await this.memberRepository.save(member);

      // 5. Get all current members for notification
      const allMembers = await this.memberRepository.find({
        where: { groupId: invitation.groupId },
        select: ['userId']
      });
      const memberIds = allMembers.map(m => m.userId);

      // 6. Get new member info
      const newMember = await this.userRepository.findOne({
        where: { id: userId }
      });

      // 7. Send notification to all existing members
      await this.notificationService.createMemberJoinedNotification(
        memberIds,
        newMember.username,
        invitation.group.groupName,
        invitation.groupId,
        userId
      );

      return {
        message: `Đã tham gia nhóm "${invitation.group.groupName}" thành công`,
        groupId: invitation.groupId
      };
    } else {
      // TODO: Send notification to inviter
      return {
        message: 'Đã từ chối lời mời gia nhập nhóm'
      };
    }
  }

  async removeMember(groupId: number, leaderId: string, memberUserId: string) {
    // 1. Verify leader permissions
    const leader = await this.memberRepository.findOne({
      where: { groupId, userId: leaderId, role: MemberRole.LEADER }
    });

    if (!leader) {
      throw new ForbiddenException('Chỉ leader mới có thể kick thành viên');
    }

    // 2. Cannot remove leader
    if (memberUserId === leaderId) {
      throw new ForbiddenException('Leader không thể tự kick chính mình');
    }

    // 3. Find and remove member
    const member = await this.memberRepository.findOne({
      where: { groupId, userId: memberUserId },
      relations: ['user']
    });

    if (!member) {
      throw new NotFoundException('Không tìm thấy thành viên trong nhóm');
    }

    await this.memberRepository.remove(member);

    // 4. Get group info and remaining members for notification
    const group = await this.groupRepository.findOne({
      where: { id: groupId }
    });

    const remainingMembers = await this.memberRepository.find({
      where: { groupId },
      select: ['userId']
    });
    const remainingMemberIds = remainingMembers.map(m => m.userId);

    // 5. Send notification to remaining members about member being removed
    if (remainingMemberIds.length > 0) {
      await this.notificationService.createMemberLeftNotification(
        remainingMemberIds,
        member.user?.username || 'Unknown user',
        group.groupName,
        groupId,
        memberUserId
      );
    }

    return {
      message: `Đã kick ${member.user?.username} khỏi nhóm`,
      removedUserId: memberUserId
    };
  }

  async leaveGroup(groupId: number, userId: string) {
    // 1. Find member
    const member = await this.memberRepository.findOne({
      where: { groupId, userId },
      relations: ['group']
    });

    if (!member) {
      throw new NotFoundException('Bạn không phải thành viên của nhóm này');
    }

    // 2. Leader cannot leave without transferring leadership
    if (member.role === MemberRole.LEADER) {
      const memberCount = await this.memberRepository.count({
        where: { groupId }
      });

      if (memberCount > 1) {
        throw new ForbiddenException('Leader phải chuyển quyền lãnh đạo trước khi rời nhóm');
      }
      // If leader is the only member, they can leave and group will be inactive
    }

    // 3. Remove member
    await this.memberRepository.remove(member);

    // 4. If leader left and was the only member, deactivate group
    if (member.role === MemberRole.LEADER) {
      await this.groupRepository.update(
        { id: groupId },
        { isActive: false }
      );
    } else {
      // 5. Get remaining members for notification (excluding the one who left)
      const remainingMembers = await this.memberRepository.find({
        where: { groupId },
        select: ['userId']
      });
      const remainingMemberIds = remainingMembers.map(m => m.userId);

      // 6. Get leaving member info
      const leavingUser = await this.userRepository.findOne({
        where: { id: userId }
      });

      // 7. Send notification to remaining members
      if (remainingMemberIds.length > 0) {
        await this.notificationService.createMemberLeftNotification(
          remainingMemberIds,
          leavingUser.username,
          member.group.groupName,
          groupId,
          userId
        );
      }
    }

    return {
      message: `Đã rời khỏi nhóm "${member.group.groupName}"`,
      groupId: groupId
    };
  }

  async getGroupInvitations(userId: string, type: 'received' | 'sent' = 'received') {
    // Get user email first
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    const whereCondition = type === 'received' 
      ? { inviteEmail: user.email, status: 'pending' as InvitationStatus }
      : { inviterId: userId };

    const invitations = await this.invitationRepository.find({
      where: whereCondition,
      order: { invitedAt: 'DESC' }
    });

    // Manually fetch related data
    const results = [];
    for (const inv of invitations) {
      const group = await this.groupRepository.findOne({ where: { id: inv.groupId } });
      const inviter = await this.userRepository.findOne({ where: { id: inv.inviterId } });
      
      results.push({
        id: inv.id,
        groupName: group?.groupName || 'Unknown Group',
        groupDescription: group?.description || '',
        status: inv.status,
        invitedBy: inviter?.username || 'Unknown User',
        inviteEmail: inv.inviteEmail,
        invitedAt: inv.invitedAt
      });
    }

    return results;
  }

  // ================= JOIN REQUEST MANAGEMENT =================

  async getJoinRequests(groupId: number, leaderId: string) {
    // 1. Kiểm tra xem user có phải là leader của nhóm không
    const group = await this.groupRepository.findOne({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundException('Nhóm không tồn tại');
    }

    if (group.leaderId !== leaderId) {
      throw new ForbiddenException('Chỉ leader mới có thể xem danh sách yêu cầu gia nhập');
    }

    // 2. Lấy danh sách join requests (pending) của nhóm
    // Join request được phân biệt với invitation bằng cách: inviterId chính là người gửi request
    const joinRequests = await this.invitationRepository.find({
      where: { 
        groupId, 
        status: 'pending' as InvitationStatus 
      },
      order: { invitedAt: 'DESC' }
    });

    // 3. Lấy thông tin của người gửi request
    const results = [];
    for (const request of joinRequests) {
      // Lấy user info từ email
      const user = await this.userRepository.findOne({
        where: { email: request.inviteEmail }
      });

      if (user && request.inviterId === user.id) { // Đây là join request (tự gửi)
        results.push({
          id: request.id,
          groupId: request.groupId,
          groupName: group.groupName,
          requesterName: user.username,
          requesterEmail: user.email,
          requesterId: user.id,
          requestedAt: request.invitedAt,
          status: request.status
        });
      }
    }

    return results;
  }

  async approveJoinRequest(requestId: number, leaderId: string) {
    // 1. Tìm join request
    const joinRequest = await this.invitationRepository.findOne({
      where: { id: requestId, status: 'pending' as InvitationStatus }
    });

    if (!joinRequest) {
      throw new NotFoundException('Yêu cầu gia nhập không tồn tại hoặc đã được xử lý');
    }

    // 2. Kiểm tra leader permission
    const group = await this.groupRepository.findOne({
      where: { id: joinRequest.groupId }
    });

    if (!group || group.leaderId !== leaderId) {
      throw new ForbiddenException('Chỉ leader mới có thể duyệt yêu cầu gia nhập');
    }

    // 3. Lấy thông tin người gửi request
    const requester = await this.userRepository.findOne({
      where: { email: joinRequest.inviteEmail }
    });

    if (!requester) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // 4. Kiểm tra xem user đã là member chưa
    const existingMember = await this.memberRepository.findOne({
      where: { groupId: joinRequest.groupId, userId: requester.id }
    });

    if (existingMember) {
      throw new ForbiddenException('Người dùng đã là thành viên của nhóm');
    }

    // 5. Thêm user vào nhóm
    const newMember = this.memberRepository.create({
      groupId: joinRequest.groupId,
      userId: requester.id,
      role: MemberRole.MEMBER
    });
    await this.memberRepository.save(newMember);

    // 6. Cập nhật status của join request
    joinRequest.status = 'accepted' as InvitationStatus;
    joinRequest.respondedAt = new Date();
    await this.invitationRepository.save(joinRequest);

    // 7. Gửi notification cho người gửi request
    await this.notificationService.createNotification({
      type: NotificationType.MEMBER_JOINED,
      title: 'Yêu cầu gia nhập được chấp nhận',
      message: `Yêu cầu gia nhập nhóm "${group.groupName}" của bạn đã được chấp nhận`,
      userId: requester.id,
      groupId: group.id,
      relatedUserId: leaderId,
    });

    // 8. Lấy danh sách thành viên để gửi notification
    const members = await this.memberRepository.find({
      where: { groupId: joinRequest.groupId },
      relations: ['user']
    });

    const memberIds = members.map(m => m.userId).filter(id => id !== requester.id);

    // 9. Thông báo cho các thành viên khác về thành viên mới
    if (memberIds.length > 0) {
      await this.notificationService.createMemberJoinedNotification(
        memberIds,
        requester.username,
        group.groupName,
        group.id,
        requester.id
      );
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

  async denyJoinRequest(requestId: number, leaderId: string) {
    // 1. Tìm join request
    const joinRequest = await this.invitationRepository.findOne({
      where: { id: requestId, status: 'pending' as InvitationStatus }
    });

    if (!joinRequest) {
      throw new NotFoundException('Yêu cầu gia nhập không tồn tại hoặc đã được xử lý');
    }

    // 2. Kiểm tra leader permission
    const group = await this.groupRepository.findOne({
      where: { id: joinRequest.groupId }
    });

    if (!group || group.leaderId !== leaderId) {
      throw new ForbiddenException('Chỉ leader mới có thể từ chối yêu cầu gia nhập');
    }

    // 3. Lấy thông tin người gửi request
    const requester = await this.userRepository.findOne({
      where: { email: joinRequest.inviteEmail }
    });

    if (!requester) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // 4. Cập nhật status của join request
    joinRequest.status = 'declined' as InvitationStatus;
    joinRequest.respondedAt = new Date();
    await this.invitationRepository.save(joinRequest);

    // 5. Gửi notification cho người gửi request
    await this.notificationService.createNotification({
      type: NotificationType.JOIN_REQUEST,
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

  async getGroupMembers(groupId: number, userId: string) {
    // 1. Kiểm tra xem user có quyền xem danh sách thành viên không (phải là member hoặc leader)
    const membership = await this.memberRepository.findOne({
      where: { groupId, userId },
      relations: ['group']
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không có quyền xem danh sách thành viên của nhóm này');
    }

    // 2. Lấy danh sách thành viên
    const members = await this.memberRepository.find({
      where: { groupId },
      relations: ['user'],
      order: { joinedAt: 'ASC' }
    });

    // 3. Format response
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

  async transferLeadership(groupId: number, currentLeaderId: string, newLeaderId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Kiểm tra nhóm tồn tại
      const group = await queryRunner.manager.findOne(StudyGroup, {
        where: { id: groupId }
      });

      if (!group) {
        throw new NotFoundException('Nhóm không tồn tại');
      }

      // 2. Kiểm tra người thực hiện có phải leader hiện tại không
      if (group.leaderId !== currentLeaderId) {
        throw new ForbiddenException('Chỉ leader hiện tại mới có quyền chuyển giao');
      }

      // 3. Kiểm tra target member tồn tại trong nhóm
      const newLeaderMember = await queryRunner.manager.findOne(GroupMember, {
        where: { 
          userId: newLeaderId, 
          groupId: groupId,
          role: MemberRole.MEMBER // Phải là member, không phải leader
        },
        relations: ['user']
      });

      if (!newLeaderMember) {
        throw new NotFoundException('Member được chọn không tồn tại trong nhóm hoặc đã là leader');
      }

      // 4. Không thể tự chuyển giao cho chính mình
      if (currentLeaderId === newLeaderId) {
        throw new ForbiddenException('Không thể tự chuyển giao quyền leader cho chính mình');
      }

      // 5. Cập nhật group leaderId
      await queryRunner.manager.update(StudyGroup, groupId, {
        leaderId: newLeaderId
      });

      // 6. Cập nhật role của leader cũ thành member
      await queryRunner.manager.update(GroupMember, {
        userId: currentLeaderId,
        groupId: groupId
      }, {
        role: MemberRole.MEMBER
      });

      // 7. Cập nhật role của member được chọn thành leader
      await queryRunner.manager.update(GroupMember, {
        userId: newLeaderId,
        groupId: groupId
      }, {
        role: MemberRole.LEADER
      });

      // 8. Lấy thông tin để gửi notification
      const oldLeader = await this.userRepository.findOne({
        where: { id: currentLeaderId }
      });
      const newLeader = newLeaderMember.user;
      
      // Lấy tất cả members để gửi thông báo
      const allMembers = await queryRunner.manager.find(GroupMember, {
        where: { groupId: groupId },
        relations: ['user']
      });

      await queryRunner.commitTransaction();

      // 9. Gửi notifications (sau khi commit thành công)
      // Notification cho leader cũ
      await this.notificationService.createNotification({
        userId: currentLeaderId,
        type: NotificationType.LEADERSHIP_TRANSFERRED,
        title: 'Đã chuyển giao quyền leader',
        message: `Bạn đã chuyển giao quyền leader của nhóm "${group.groupName}" cho ${newLeader.username}`,
        groupId: groupId,
        relatedUserId: newLeaderId.toString()
      });

      // Notification cho leader mới
      await this.notificationService.createNotification({
        userId: newLeaderId,
        type: NotificationType.LEADERSHIP_RECEIVED,
        title: 'Được bổ nhiệm làm leader',
        message: `Bạn đã được ${oldLeader.username} bổ nhiệm làm leader của nhóm "${group.groupName}"`,
        groupId: groupId,
        relatedUserId: currentLeaderId
      });

      // Notification cho tất cả members khác
      for (const member of allMembers) {
        const memberId = member.userId;
        if (memberId !== currentLeaderId && memberId !== newLeaderId) {
          await this.notificationService.createNotification({
            userId: memberId,
            type: NotificationType.LEADERSHIP_CHANGED,
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

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}