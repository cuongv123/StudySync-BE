import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { UserSubscription } from '../entities/user-subscription.entity';
import { WalletService } from './wallet.service';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription)
    private readonly subscriptionRepository: Repository<UserSubscription>,
    private readonly walletService: WalletService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get all available subscription plans
   */
  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return await this.planRepository.find({
      where: { isActive: true },
      order: { price: 'ASC' },
    });
  }

  /**
   * Get plan by ID
   */
  async getPlanById(planId: number): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({
      where: { id: planId, isActive: true },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    return await this.subscriptionRepository.findOne({
      where: { userId, isActive: true },
      relations: ['plan'],
    });
  }

  /**
   * Get user's subscription history
   */
  async getUserSubscriptionHistory(userId: string, limit: number = 20, offset: number = 0): Promise<UserSubscription[]> {
    return await this.subscriptionRepository.find({
      where: { userId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Check if user can use a feature based on their subscription
   */
  async checkFeatureAccess(userId: string, feature: 'storage' | 'video' | 'ai', requiredAmount: number = 1): Promise<{
    hasAccess: boolean;
    remainingUsage: number;
    planLimit: number;
    currentUsage: number;
  }> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription || !subscription.plan) {
      return {
        hasAccess: false,
        remainingUsage: 0,
        planLimit: 0,
        currentUsage: 0,
      };
    }

    let currentUsage: number;
    let planLimit: number;

    switch (feature) {
      case 'storage':
        currentUsage = subscription.usagePersonalStorageMb;
        planLimit = subscription.plan.personalStorageLimitMb;
        break;
      case 'video':
        currentUsage = subscription.usageVideoMinutes;
        planLimit = subscription.plan.videoCallMinutesLimit;
        break;
      case 'ai':
        currentUsage = subscription.usageAiQueries;
        planLimit = subscription.plan.aiQueriesLimit;
        break;
      default:
        throw new BadRequestException('Invalid feature type');
    }

    const remainingUsage = Math.max(0, planLimit - currentUsage);
    const hasAccess = remainingUsage >= requiredAmount;

    return {
      hasAccess,
      remainingUsage,
      planLimit,
      currentUsage,
    };
  }

  /**
   * Record feature usage
   */
  async recordUsage(userId: string, feature: 'storage' | 'video' | 'ai', amount: number): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    // Check if usage is within limits
    const featureAccess = await this.checkFeatureAccess(userId, feature, amount);
    if (!featureAccess.hasAccess) {
      throw new BadRequestException(`Usage limit exceeded for ${feature}`);
    }

    // Update usage
    switch (feature) {
      case 'storage':
        subscription.usagePersonalStorageMb += amount;
        break;
      case 'video':
        subscription.usageVideoMinutes += amount;
        break;
      case 'ai':
        subscription.usageAiQueries += amount;
        break;
    }

    await this.subscriptionRepository.save(subscription);
    
    this.logger.log(`Usage recorded: ${feature} +${amount} for user: ${userId}`);
  }

  /**
   * Upgrade subscription using wallet balance
   */
  async upgradeWithWallet(userId: string, planId: number): Promise<UserSubscription> {
    // Get target plan
    const plan = await this.getPlanById(planId);
    
    // Check wallet balance
    const wallet = await this.walletService.getOrCreateWallet(userId);
    if (!wallet.hasEnoughBalance(plan.price)) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Deduct from wallet
    await this.walletService.withdraw(
      userId,
      plan.price,
      `Subscription upgrade to ${plan.planName}`,
    );

    // Update or create subscription
    let subscription = await this.getUserSubscription(userId);
    
    if (subscription) {
      // Upgrade existing
      subscription.planId = plan.id;
      subscription.endDate = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);
      subscription.purchasedFromWallet = true;
      // Reset usage
      subscription.usagePersonalStorageMb = 0;
      subscription.usageVideoMinutes = 0;
      subscription.usageAiQueries = 0;
      subscription.lastResetDate = new Date();
    } else {
      // Create new subscription
      subscription = this.subscriptionRepository.create({
        userId,
        planId: plan.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000),
        isActive: true,
        purchasedFromWallet: true,
        usagePersonalStorageMb: 0,
        usageVideoMinutes: 0,
        usageAiQueries: 0,
        lastResetDate: new Date(),
      });
    }

    await this.subscriptionRepository.save(subscription);

    this.logger.log(`Subscription upgraded: User ${userId} to plan ${plan.planName}`);
    
    return await this.getUserSubscription(userId);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    subscription.isActive = false;
    subscription.autoRenew = false;
    await this.subscriptionRepository.save(subscription);

    this.logger.log(`Subscription cancelled for user: ${userId}`);
  }

  /**
   * Reactivate subscription
   */
  async reactivateSubscription(userId: string): Promise<UserSubscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId, isActive: false },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });

    if (!subscription) {
      throw new NotFoundException('No cancelled subscription found');
    }

    if (subscription.endDate && new Date() > subscription.endDate) {
      throw new BadRequestException('Subscription has expired and cannot be reactivated');
    }

    subscription.isActive = true;
    await this.subscriptionRepository.save(subscription);

    this.logger.log(`Subscription reactivated for user: ${userId}`);
    
    return subscription;
  }

  /**
   * Get subscription statistics for admin
   */
  async getSubscriptionStats(): Promise<{
    totalActiveSubscriptions: number;
    subscriptionsByPlan: Array<{ planName: string; count: number }>;
    totalRevenue: number;
  }> {
    const activeSubscriptions = await this.subscriptionRepository.count({
      where: { isActive: true },
    });

    const subscriptionsByPlan = await this.subscriptionRepository
      .createQueryBuilder('sub')
      .leftJoinAndSelect('sub.plan', 'plan')
      .select('plan.planName', 'planName')
      .addSelect('COUNT(sub.id)', 'count')
      .where('sub.isActive = :isActive', { isActive: true })
      .groupBy('plan.id')
      .getRawMany();

    // Calculate revenue (simplified - you might want to add a payments table reference)
    const revenueQuery = await this.subscriptionRepository
      .createQueryBuilder('sub')
      .leftJoin('sub.plan', 'plan')
      .select('SUM(plan.price)', 'total')
      .where('sub.purchasedFromWallet = :purchasedFromWallet', { purchasedFromWallet: true })
      .getRawOne();

    return {
      totalActiveSubscriptions: activeSubscriptions,
      subscriptionsByPlan: subscriptionsByPlan.map(item => ({
        planName: item.planName,
        count: parseInt(item.count),
      })),
      totalRevenue: parseFloat(revenueQuery.total) || 0,
    };
  }
}