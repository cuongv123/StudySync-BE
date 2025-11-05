import { Repository } from 'typeorm';
import { AiQueryHistory } from './entities/ai-query-history.entity';
import { Conversation } from './entities/conversation.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { SaveHistoryDto } from './dto/save-history.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
export declare class AiChatService {
    private readonly aiHistoryRepo;
    private readonly conversationRepo;
    private readonly subscriptionRepo;
    private readonly logger;
    constructor(aiHistoryRepo: Repository<AiQueryHistory>, conversationRepo: Repository<Conversation>, subscriptionRepo: Repository<UserSubscription>);
    createConversation(userId: string, dto?: CreateConversationDto): Promise<Conversation>;
    getConversations(userId: string, pagination: PaginationDto): Promise<{
        items: {
            id: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
            messageCount: number;
            lastMessage: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getConversationMessages(userId: string, conversationId: string, pagination: PaginationDto): Promise<{
        conversation: {
            id: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
        };
        messages: AiQueryHistory[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    deleteConversation(userId: string, conversationId: string): Promise<{
        message: string;
    }>;
    saveHistory(userId: string, dto: SaveHistoryDto): Promise<{
        id: number;
        conversationId: string;
        message: string;
    }>;
    getHistory(userId: string, pagination: PaginationDto): Promise<{
        items: AiQueryHistory[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getHistoryById(userId: string, historyId: number): Promise<AiQueryHistory>;
    deleteHistory(userId: string, historyId: number): Promise<{
        message: string;
    }>;
    clearHistory(userId: string): Promise<{
        message: string;
    }>;
    getUsage(userId: string): Promise<{
        used: number;
        limit: number;
        remaining: number;
        planName: string;
    }>;
    private checkUsageLimit;
    private updateUsageCounter;
}
