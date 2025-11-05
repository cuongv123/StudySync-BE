import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiQueryHistory } from './entities/ai-query-history.entity';
import { Conversation } from './entities/conversation.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { SaveHistoryDto } from './dto/save-history.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(
    @InjectRepository(AiQueryHistory)
    private readonly aiHistoryRepo: Repository<AiQueryHistory>,
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(UserSubscription)
    private readonly subscriptionRepo: Repository<UserSubscription>,
  ) {}

  /**
   * Tạo conversation mới
   */
  async createConversation(userId: string, dto?: CreateConversationDto) {
    const conversation = this.conversationRepo.create({
      userId,
      title: dto?.title || 'New Conversation', // Sẽ update sau với câu hỏi đầu tiên
    });

    await this.conversationRepo.save(conversation);

    this.logger.log(`Conversation created: ${conversation.id} for user ${userId}`);

    return conversation;
  }

  /**
   * Lấy danh sách conversations (cho sidebar)
   */
  async getConversations(userId: string, pagination: PaginationDto) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.conversationRepo.findAndCount({
      where: { userId },
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
      relations: ['messages'],
    });

    // Format để hiển thị preview
    const formatted = items.map(conv => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv.messages?.length || 0,
      lastMessage: conv.messages?.[0]?.queryText || null,
    }));

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy messages trong 1 conversation
   */
  async getConversationMessages(userId: string, conversationId: string, pagination: PaginationDto) {
    // Verify ownership
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.aiHistoryRepo.findAndCount({
      where: { conversationId, userId },
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });

    return {
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      messages: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Xóa conversation (và tất cả messages trong đó)
   */
  async deleteConversation(userId: string, conversationId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.conversationRepo.remove(conversation);

    this.logger.log(`Conversation deleted: ${conversationId}`);

    return { message: 'Conversation deleted successfully' };
  }

  /**
   * Lưu lịch sử chat AI (với conversation support)
   */
  async saveHistory(userId: string, dto: SaveHistoryDto) {
    try {
      // 1. Check usage limit
      await this.checkUsageLimit(userId);

      let conversationId = dto.conversationId;

      // 2. Nếu không có conversationId, tạo conversation mới
      if (!conversationId) {
        // Auto-generate title từ query (lấy 50 ký tự đầu)
        const autoTitle = dto.query.length > 50 
          ? dto.query.substring(0, 50) + '...' 
          : dto.query;

        const conversation = await this.createConversation(userId, { title: autoTitle });
        conversationId = conversation.id;
      } else {
        // Verify conversation ownership
        const conversation = await this.conversationRepo.findOne({
          where: { id: conversationId, userId },
        });

        if (!conversation) {
          throw new NotFoundException('Conversation not found');
        }

        // Update conversation updatedAt
        conversation.updatedAt = new Date();
        await this.conversationRepo.save(conversation);
      }

      // 3. Lưu message vào database
      const history = this.aiHistoryRepo.create({
        userId,
        conversationId,
        queryText: dto.query,
        responseText: dto.response,
      });

      await this.aiHistoryRepo.save(history);

      // 4. Update usage counter
      await this.updateUsageCounter(userId);

      this.logger.log(`AI history saved for user ${userId} in conversation ${conversationId}`);

      return {
        id: history.id,
        conversationId,
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
