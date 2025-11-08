import { User } from '../../User/entities/User.entity';
import { StudyGroup } from './group.entity';
export declare enum InvitationStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
export declare class GroupInvitation {
    id: number;
    inviteEmail: string;
    inviterId: string;
    groupId: number;
    status: InvitationStatus;
    message: string;
    invitedAt: Date;
    respondedAt: Date;
    expiresAt: Date;
    inviter: User;
    group: StudyGroup;
}
