import { AiChatService } from './ai-chat.service';
import { SaveHistoryDto } from './dto/save-history.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
export declare class AiChatController {
    private readonly aiChatService;
    constructor(aiChatService: AiChatService);
    createConversation(req: any, dto: CreateConversationDto): Promise<{
        data: import("./entities/conversation.entity").Conversation;
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getConversations(req: any, pagination: PaginationDto): Promise<{
        data: {
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
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getConversationMessages(req: any, conversationId: string, pagination: PaginationDto): Promise<{
        data: {
            conversation: {
                id: string;
                title: string;
                createdAt: Date;
                updatedAt: Date;
            };
            messages: import("./entities/ai-query-history.entity").AiQueryHistory[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    deleteConversation(req: any, conversationId: string): Promise<{
        data: {
            message: string;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    saveHistory(req: any, dto: SaveHistoryDto): Promise<{
        data: {
            id: number;
            conversationId: string;
            message: string;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getHistory(req: any, pagination: PaginationDto): Promise<{
        data: {
            items: import("./entities/ai-query-history.entity").AiQueryHistory[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getHistoryById(req: any, id: number): Promise<{
        data: import("./entities/ai-query-history.entity").AiQueryHistory;
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    deleteHistory(req: any, id: number): Promise<{
        data: {
            message: string;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    clearHistory(req: any): Promise<{
        data: {
            message: string;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getUsage(req: any): Promise<{
        data: {
            used: number;
            limit: number;
            remaining: number;
            planName: string;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
}
