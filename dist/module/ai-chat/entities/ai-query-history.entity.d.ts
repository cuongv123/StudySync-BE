import { User } from '../../User/entities/User.entity';
import { Conversation } from './conversation.entity';
export declare class AiQueryHistory {
    id: number;
    userId: string;
    conversationId: string;
    queryText: string;
    responseText: string;
    createdAt: Date;
    user: User;
    conversation: Conversation;
}
