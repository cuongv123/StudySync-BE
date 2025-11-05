import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../User/User.service';
import { ReviewService } from '../review/review.service';
import { SubscriptionPayment, PaymentStatus } from '../subscription/entities/subscription-payment.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { SubscriptionPlan } from '../subscription/entities/subscription-plan.entity';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly reviewService: ReviewService,
    @InjectRepository(SubscriptionPayment)
    private readonly paymentRepository: Repository<SubscriptionPayment>,
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
  ) {}

  async getAdminProfile(adminId: string) {
    return this.usersService.findOne(adminId);
  }

  async getDashboard() {
    const totalUsers = await this.usersService.findAll();
    const totalRevenue = await this.getTotalRevenue();
    const subscriptionStats = await this.getSubscriptionStats();
    const reviewStats = await this.reviewService.getAdminStats?.();

    return {
      totalUsers: Array.isArray(totalUsers) ? totalUsers.length : 0,
      totalRevenue: totalRevenue.total,
      subscriptionStats,
      reviewStats: reviewStats || {},
    };
  }

  async listUsers(adminId: string, query: any) {
    const allUsers = await this.usersService.findAll();
    return Array.isArray(allUsers) 
      ? allUsers.filter(user => user.id !== adminId)
      : [];
  }

  async getUserById(id: string) {
    return this.usersService.findOne(id);
  }

  async resetUserPassword(id: string, newPassword: string) {
    return this.usersService.resetPassword(id, newPassword);
  }

  async deleteUser(id: string) {
    return this.usersService.remove(id);
  }

  async assignRole(userId: string, role: Role) {
    return this.usersService.assignRole(userId, role);
  }

  async getTotalRevenue() {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.PAID })
      .getRawOne();

    return {
      total: parseFloat(result?.total) || 0,
      currency: 'VND',
    };
  }

  async getSubscriptionStats() {
    const plans = await this.planRepository.find();
    const stats = await Promise.all(
      plans.map(async (plan) => {
        const count = await this.userSubscriptionRepository.count({
          where: { planId: plan.id, isActive: true },
        });
        return {
          planName: plan.planName,
          planId: plan.id,
          activeSubscriptions: count,
        };
      }),
    );

    return {
      byPlan: stats,
      total: stats.reduce((sum, stat) => sum + stat.activeSubscriptions, 0),
    };
  }
}
