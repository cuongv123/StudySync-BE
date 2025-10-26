import { User } from '../../User/entities/User.entity';
export declare enum NotificationType {
    INVITE_RECEIVED = "invite_received",
    JOIN_REQUEST = "join_request",
    MEMBER_JOINED = "member_joined",
    MEMBER_LEFT = "member_left",
    MEMBER_REMOVED = "member_removed",
    GROUP_UPDATED = "group_updated",
    LEADERSHIP_TRANSFERRED = "leadership_transferred",
    LEADERSHIP_RECEIVED = "leadership_received",
    LEADERSHIP_CHANGED = "leadership_changed",
    NEW_MESSAGE = "new_message",
    MESSAGE_REPLY = "message_reply"
}
export declare class Notification {
    id: number;
    type: string;
    title: string;
    content: string;
    isRead: boolean;
    userId: string;
    user: User;
    relatedId?: number;
    relatedType?: string;
    createdAt: Date;
}
