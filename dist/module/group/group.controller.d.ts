import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JoinGroupRequestDto } from './dto/member-actions.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';
import { TransferLeadershipDto } from './dto/transfer-leadership.dto';
export declare class GroupController {
    private readonly groupService;
    constructor(groupService: GroupService);
    create(createDto: CreateGroupDto, req: any): Promise<import("./entities/group.entity").StudyGroup>;
    getAllGroups(req: any): Promise<{
        isMember: boolean;
        id: number;
        groupName: string;
        description: string;
        leaderId: string;
        storageLimitMb: number;
        totalStorageUsedMb: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        leader: import("../User/entities/User.entity").User;
        members: import("./entities/group-member.entity").GroupMember[];
        invitations: import("./entities/group-invitation.entity").GroupInvitation[];
    }[]>;
    getMyGroups(req: any): Promise<import("./entities/group.entity").StudyGroup[]>;
    getReceivedInvitations(req: any): Promise<any[]>;
    getSentInvitations(req: any): Promise<any[]>;
    getGroupDetail(id: number, req: any): Promise<import("./entities/group.entity").StudyGroup>;
    updateGroup(id: number, updateDto: UpdateGroupDto, req: any): Promise<import("./entities/group.entity").StudyGroup>;
    inviteMember(groupId: number, inviteDto: InviteMemberDto, req: any): Promise<{
        message: string;
        invitationId: number;
    }>;
    requestJoinGroup(groupId: number, joinDto: JoinGroupRequestDto, req: any): Promise<{
        message: string;
        requestId: number;
    }>;
    getJoinRequests(groupId: number, req: any): Promise<any[]>;
    approveJoinRequest(requestId: number, req: any): Promise<{
        message: string;
        newMember: {
            id: string;
            username: string;
            email: string;
            role: string;
        };
    }>;
    denyJoinRequest(requestId: number, req: any): Promise<{
        message: string;
        requester: {
            id: string;
            username: string;
            email: string;
        };
    }>;
    respondToInvitation(invitationId: number, responseDto: RespondInvitationDto, req: any): Promise<{
        message: string;
        groupId: number;
    } | {
        message: string;
        groupId?: undefined;
    }>;
    getGroupMembers(groupId: number, req: any): Promise<{
        groupId: number;
        groupName: string;
        members: {
            id: string;
            username: string;
            email: string;
            role: import("./entities/group-member.entity").MemberRole;
            joinedAt: Date;
            isLeader: boolean;
        }[];
    }>;
    removeMember(groupId: number, userId: string, req: any): Promise<{
        message: string;
        removedUserId: string;
    }>;
    transferLeadership(groupId: number, transferDto: TransferLeadershipDto, req: any): Promise<{
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
    leaveGroup(groupId: number, req: any): Promise<{
        message: string;
        groupId: number;
    }>;
}
