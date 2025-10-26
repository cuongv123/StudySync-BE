import { User } from '../../User/entities/User.entity';
import { StudyGroup } from './group.entity';
export declare enum MemberRole {
    LEADER = "leader",
    MEMBER = "member"
}
export declare class GroupMember {
    id: number;
    userId: string;
    groupId: number;
    role: MemberRole;
    joinedAt: Date;
    user: User;
    group: StudyGroup;
}
