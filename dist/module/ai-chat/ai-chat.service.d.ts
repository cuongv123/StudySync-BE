import { Repository } from 'typeorm';
import { AiQueryHistory } from './entities/ai-query-history.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { SaveHistoryDto } from './dto/save-history.dto';
import { PaginationDto } from './dto/pagination.dto';
export declare class AiChatService {
    private readonly aiHistoryRepo;
    private readonly subscriptionRepo;
    private readonly logger;
    constructor(aiHistoryRepo: Repository<AiQueryHistory>, subscriptionRepo: Repository<UserSubscription>);
    saveHistory(userId: string, dto: SaveHistoryDto): Promise<{
        id: number;
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
