import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiQueryHistory } from './entities/ai-query-history.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { SaveHistoryDto } from './dto/save-history.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    @InjectRepository(AiQueryHistory)
    private readonly aiHistoryRepo: Repository<AiQueryHistory>,
    @InjectRepository(UserSubscription)
    private readonly subscriptionRepo: Repository<UserSubscription>,
  ) {}

  /**
   * Lưu lịch sử chat AI
   */
  async saveHistory(userId: string, dto: SaveHistoryDto) {
    try {
      // 1. Check usage limit (optional - có thể bỏ nếu không muốn limit)
      await this.checkUsageLimit(userId);

      // 2. Lưu vào database
      const history = this.aiHistoryRepo.create({
        userId,
        queryText: dto.query,
        responseText: dto.response,
      });

      await this.aiHistoryRepo.save(history);

      // 3. Update usage counter
      await this.updateUsageCounter(userId);

      this.logger.log(`AI history saved for user ${userId}`);

      return {
        id: history.id,
        message: 'History saved successfully',
      };
    } catch (error: any) {
      this.logger.error(`Failed to save AI history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lấy lịch sử chat AI của user
   */
  async getHistory(userId: string, pagination: PaginationDto) {
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

  /**
   * Lấy chi tiết 1 history
   */
  async getHistoryById(userId: string, historyId: number) {
    const history = await this.aiHistoryRepo.findOne({
      where: { id: historyId, userId },
    });

    if (!history) {
      throw new NotFoundException('History not found');
    }

    return history;
  }

  /**
   * Xóa 1 history
   */
  async deleteHistory(userId: string, historyId: number) {
    const history = await this.aiHistoryRepo.findOne({
      where: { id: historyId, userId },
    });

    if (!history) {
      throw new NotFoundException('History not found');
    }

    await this.aiHistoryRepo.remove(history);

    return { message: 'History deleted successfully' };
  }

  /**
   * Xóa toàn bộ history của user
   */
  async clearHistory(userId: string) {
    await this.aiHistoryRepo.delete({ userId });
    return { message: 'All history cleared successfully' };
  }

  /**
   * Lấy thông tin usage
   */
  async getUsage(userId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId, isActive: true },
      relations: ['plan'],
    });

    if (!subscription) {
      return {
        used: 0,
        limit: 50, // free plan default
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

  /**
   * Check usage limit (optional)
   */
  private async checkUsageLimit(userId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId, isActive: true },
      relations: ['plan'],
    });

    // Nếu không có subscription, coi như free plan
    if (!subscription) {
      // Check số lượng queries đã dùng
      const count = await this.aiHistoryRepo.count({ where: { userId } });
      if (count >= 50) { // Free plan limit
        throw new BadRequestException('AI query limit reached. Please upgrade to Pro plan.');
      }
      return;
    }

    // Check limit theo plan
    const used = subscription.usageAiQueries || 0;
    const limit = subscription.plan.aiQueriesLimit;

    if (used >= limit) {
      throw new BadRequestException(
        `AI query limit reached (${limit} queries). Please upgrade your plan.`
      );
    }
  }

  /**
   * Update usage counter
   */
  private async updateUsageCounter(userId: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { userId, isActive: true },
    });

    if (subscription) {
      subscription.usageAiQueries = (subscription.usageAiQueries || 0) + 1;
      await this.subscriptionRepo.save(subscription);
    }
  }
}
