import { StudyGroup } from '../../group/entities/group.entity';
import { User } from '../../User/entities/User.entity';
export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    FILE = "file",
    SYSTEM = "system"
}
export declare class Message {
    id: number;
    content: string;
    groupId: number;
    senderId: string;
    type: MessageType;
    attachments?: {
        filename: string;
        url: string;
        size: number;
        mimeType: string;
    }[];
    isEdited: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
    replyToId?: number;
    createdAt: Date;
    updatedAt: Date;
    group: StudyGroup;
    sender: User;
    replyTo?: Message;
}
