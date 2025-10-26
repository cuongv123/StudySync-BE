import { User } from '../../User/entities/User.entity';
import { GroupMember } from './group-member.entity';
import { GroupInvitation } from './group-invitation.entity';
export declare class StudyGroup {
    id: number;
    groupName: string;
    description: string;
    leaderId: string;
    storageLimitMb: number;
    totalStorageUsedMb: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    leader: User;
    members: GroupMember[];
    invitations: GroupInvitation[];
}
