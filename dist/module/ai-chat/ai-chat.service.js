"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AiChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ai_query_history_entity_1 = require("./entities/ai-query-history.entity");
const user_subscription_entity_1 = require("../subscription/entities/user-subscription.entity");
let AiChatService = AiChatService_1 = class AiChatService {
    constructor(aiHistoryRepo, subscriptionRepo) {
        this.aiHistoryRepo = aiHistoryRepo;
        this.subscriptionRepo = subscriptionRepo;
        this.logger = new common_1.Logger(AiChatService_1.name);
    }
    async saveHistory(userId, dto) {
        try {
            await this.checkUsageLimit(userId);
            const history = this.aiHistoryRepo.create({
                userId,
                queryText: dto.query,
                responseText: dto.response,
            });
            await this.aiHistoryRepo.save(history);
            await this.updateUsageCounter(userId);
            this.logger.log(`AI history saved for user ${userId}`);
            return {
                id: history.id,
                message: 'History saved successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to save AI history: ${error.message}`);
            throw error;
        }
    }
    async getHistory(userId, pagination) {
        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;
        const [items, total] = await this.aiHistoryRepo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getHistoryById(userId, historyId) {
        const history = await this.aiHistoryRepo.findOne({
            where: { id: historyId, userId },
        });
        if (!history) {
            throw new common_1.NotFoundException('History not found');
        }
        return history;
    }
    async deleteHistory(userId, historyId) {
        const history = await this.aiHistoryRepo.findOne({
            where: { id: historyId, userId },
        });
        if (!history) {
            throw new common_1.NotFoundException('History not found');
        }
        await this.aiHistoryRepo.remove(history);
        return { message: 'History deleted successfully' };
    }
    async clearHistory(userId) {
        await this.aiHistoryRepo.delete({ userId });
        return { message: 'All history cleared successfully' };
    }
    async getUsage(userId) {
        const subscription = await this.subscriptionRepo.findOne({
            where: { userId, isActive: true },
            relations: ['plan'],
        });
        if (!subscription) {
            return {
                used: 0,
                limit: 50,
                remaining: 50,
                planName: 'free',
            };
        }
        const used = subscription.usageAiQueries || 0;
        const limit = subscription.plan.aiQueriesLimit;
        const remaining = Math.max(0, limit - used);
        return {
            used,
            limit,
            remaining,
            planName: subscription.plan.planName,
        };
    }
    async checkUsageLimit(userId) {
        const subscription = await this.subscriptionRepo.findOne({
            where: { userId, isActive: true },
            relations: ['plan'],
        });
        if (!subscription) {
            const count = await this.aiHistoryRepo.count({ where: { userId } });
            if (count >= 50) {
                throw new common_1.BadRequestException('AI query limit reached. Please upgrade to Pro plan.');
            }
            return;
        }
        const used = subscription.usageAiQueries || 0;
        const limit = subscription.plan.aiQueriesLimit;
        if (used >= limit) {
            throw new common_1.BadRequestException(`AI query limit reached (${limit} queries). Please upgrade your plan.`);
        }
    }
    async updateUsageCounter(userId) {
        const subscription = await this.subscriptionRepo.findOne({
            where: { userId, isActive: true },
        });
        if (subscription) {
            subscription.usageAiQueries = (subscription.usageAiQueries || 0) + 1;
            await this.subscriptionRepo.save(subscription);
        }
    }
};
exports.AiChatService = AiChatService;
exports.AiChatService = AiChatService = AiChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ai_query_history_entity_1.AiQueryHistory)),
    __param(1, (0, typeorm_1.InjectRepository)(user_subscription_entity_1.UserSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AiChatService);
//# sourceMappingURL=ai-chat.service.js.map