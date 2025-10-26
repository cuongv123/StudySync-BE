import { AiChatService } from './ai-chat.service';
import { SaveHistoryDto } from './dto/save-history.dto';
import { PaginationDto } from './dto/pagination.dto';
export declare class AiChatController {
    private readonly aiChatService;
    constructor(aiChatService: AiChatService);
    saveHistory(req: any, dto: SaveHistoryDto): Promise<{
        data: {
            id: number;
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
