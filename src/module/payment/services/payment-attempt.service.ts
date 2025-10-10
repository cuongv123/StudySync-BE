import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentAttempt } from '../entities/payment-attempt.entity';

@Injectable()
export class PaymentAttemptService {
  constructor(
    @InjectRepository(PaymentAttempt)
    private attemptRepository: Repository<PaymentAttempt>,
    private configService: ConfigService,
  ) {}

  /**
   * Check if user can attempt payment (not blocked)
   */
  async canAttemptPayment(userId: string): Promise<{
    canAttempt: boolean;
    attemptsRemaining: number;
    blockedUntil?: Date;
    minutesRemaining?: number;
  }> {
    const attempt = await this.getOrCreateAttempt(userId);
    const maxAttempts = this.configService.get('MAX_FAILED_PAYMENT_ATTEMPTS', 3);
    
    const canAttempt = attempt.canAttemptPayment();
    const attemptsRemaining = Math.max(0, maxAttempts - attempt.attemptCount);
    const minutesRemaining = attempt.getBlockedMinutesRemaining();

    return {
      canAttempt,
      attemptsRemaining,
      blockedUntil: attempt.blockedUntil,
      minutesRemaining,
    };
  }

  /**
   * Record a failed payment attempt
   */
  async recordFailedAttempt(userId: string): Promise<{
    attemptsRemaining: number;
    isBlocked: boolean;
    blockedUntil?: Date;
    minutesRemaining?: number;
  }> {
    const attempt = await this.getOrCreateAttempt(userId);
    const maxAttempts = this.configService.get('MAX_FAILED_PAYMENT_ATTEMPTS', 3);
    const blockDurationMinutes = this.configService.get('PAYMENT_BLOCK_DURATION_MINUTES', 30);
    
    attempt.incrementAttempt(maxAttempts, blockDurationMinutes);
    await this.attemptRepository.save(attempt);

    const attemptsRemaining = Math.max(0, maxAttempts - attempt.attemptCount);
    const isBlocked = attempt.isBlocked();
    const minutesRemaining = attempt.getBlockedMinutesRemaining();

    return {
      attemptsRemaining,
      isBlocked,
      blockedUntil: attempt.blockedUntil,
      minutesRemaining,
    };
  }

  /**
   * Reset attempts for user (after successful payment)
   */
  async resetAttempts(userId: string): Promise<void> {
    const attempt = await this.getOrCreateAttempt(userId);
    attempt.resetAttempts();
    await this.attemptRepository.save(attempt);
  }

  /**
   * Get attempt status for user
   */
  async getAttemptStatus(userId: string): Promise<PaymentAttempt> {
    return this.getOrCreateAttempt(userId);
  }

  /**
   * Get or create payment attempt record
   */
  private async getOrCreateAttempt(userId: string): Promise<PaymentAttempt> {
    let attempt = await this.attemptRepository.findOne({
      where: { userId },
    });

    if (!attempt) {
      attempt = this.attemptRepository.create({
        userId,
        attemptCount: 0,
        lastAttemptAt: new Date(),
        blockedUntil: null,
      });
      await this.attemptRepository.save(attempt);
    }

    return attempt;
  }

  /**
   * Check if user is currently blocked
   */
  async isUserBlocked(userId: string): Promise<boolean> {
    const attempt = await this.getOrCreateAttempt(userId);
    return attempt.isBlocked();
  }

  /**
   * Get all blocked users (for admin)
   */
  async getBlockedUsers(): Promise<PaymentAttempt[]> {
    return this.attemptRepository
      .createQueryBuilder('attempt')
      .where('attempt.blockedUntil > :now', { now: new Date() })
      .orderBy('attempt.blockedUntil', 'DESC')
      .getMany();
  }

  /**
   * Manually unblock user (admin function)
   */
  async unblockUser(userId: string): Promise<void> {
    const attempt = await this.getOrCreateAttempt(userId);
    attempt.resetAttempts();
    await this.attemptRepository.save(attempt);
  }
}