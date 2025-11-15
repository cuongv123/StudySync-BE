import { Repository, DataSource } from 'typeorm';
import { StudyGroup } from './entities/group.entity';
import { GroupMember, MemberRole } from './entities/group-member.entity';
import { GroupInvitation, InvitationStatus } from './entities/group-invitation.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { User } from '../User/entities/User.entity';
import { NotificationService } from '../notification/notification.service';
export declare class GroupService {
    private groupRepository;
    private memberRepository;
    private invitationRepository;
    private userRepository;
    private dataSource;
    private notificationService;
    constructor(groupRepository: Repository<StudyGroup>, memberRepository: Repository<GroupMember>, invitationRepository: Repository<GroupInvitation>, userRepository: Repository<User>, dataSource: DataSource, notificationService: NotificationService);
    createGroup(createDto: CreateGroupDto, userId: string): Promise<StudyGroup>;
    getMyGroups(userId: string): Promise<StudyGroup[]>;
    getAllGroups(userId: string): Promise<{
        isMember: boolean;
        id: number;
        groupName: string;
        description: string;
        subject: string;
        leaderId: string;
        storageLimitMb: number;
        totalStorageUsedMb: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        leader: User;
        members: GroupMember[];
        invitations: GroupInvitation[];
    }[]>;
    getGroupDetail(id: number, userId: string): Promise<StudyGroup>;
    updateGroup(id: number, updateDto: UpdateGroupDto, userId: string): Promise<StudyGroup>;
    deleteGroup(id: number, userId: string): Promise<{
        message: string;
    }>;
    getGroupMembersWithRoles(groupId: number, userId: string): Promise<{
        userId: string;
        username: string;
        email: string;
        role: MemberRole;
        joinedAt: Date;
    }[]>;
    inviteMember(groupId: number, leaderId: string, memberEmail: string, message?: string): Promise<{
        message: string;
        invitationId: number;
    }>;
    requestJoinGroup(groupId: number, userId: string, message?: string): Promise<{
        message: string;
        requestId: number;
    }>;
    respondToInvitation(invitationId: number, userId: string, response: InvitationStatus): Promise<{
        message: string;
        groupId: number;
    } | {
        message: string;
        groupId?: undefined;
    }>;
    removeMember(groupId: number, leaderId: string, memberUserId: string): Promise<{
        message: string;
        removedUserId: string;
    }>;
    leaveGroup(groupId: number, userId: string): Promise<{
        message: string;
        groupId: number;
    }>;
    getGroupInvitations(userId: string, type?: 'received' | 'sent'): Promise<{
        id: number;
        groupName: string;
        groupDescription: string;
        status: InvitationStatus;
        invitedBy: string;
        inviteEmail: string;
        invitedAt: Date;
    }[]>;
    getJoinRequests(groupId: number, leaderId: string): Promise<any[]>;
    approveJoinRequest(requestId: number, leaderId: string): Promise<{
        message: string;
        newMember: {
            id: string;
            username: string;
            email: string;
            role: string;
        };
    }>;
    denyJoinRequest(requestId: number, leaderId: string): Promise<{
        message: string;
        requester: {
            id: string;
            username: string;
            email: string;
        };
    }>;
    getGroupMembers(groupId: number, userId: string): Promise<{
        groupId: number;
        groupName: string;
        members: {
            id: string;
            username: string;
            email: string;
            role: MemberRole;
            joinedAt: Date;
            isLeader: boolean;
        }[];
    }>;
    transferLeadership(groupId: number, currentLeaderId: string, newLeaderId: string): Promise<{
        message: string;
        oldLeader: {
            id: string;
            username: string;
        };
        newLeader: {
            id: string;
            username: string;
        };
        group: {
            id: number;
            groupName: string;
        };
    }>;
    expireOldInvitations(): Promise<void>;
}
