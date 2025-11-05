import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AdminReplyDto } from './dto/admin-reply.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  // ============ PUBLIC APIs (No login required) ============

  // Get all public reviews
  async getPublicReviews(filter: ReviewFilterDto) {
    const { page = 1, limit = 20, rating } = filter;
    const skip = (page - 1) * limit;

    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.admin', 'admin')
      .where('review.isPublic = :isPublic', { isPublic: true });

    if (rating) {
      query.andWhere('review.rating = :rating', { rating });
    }

    const [items, total] = await query
      .orderBy('review.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Calculate stats
    const stats = await this.getReviewStats();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats,
    };
  }

  // Get review statistics
  async getReviewStats() {
    const total = await this.reviewRepository.count({
      where: { isPublic: true },
    });

    const avgResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .where('review.isPublic = :isPublic', { isPublic: true })
      .getRawOne();

    // Rating distribution
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      const count = await this.reviewRepository.count({
        where: { rating: i, isPublic: true },
      });
      distribution[i] = count;
    }

    return {
      totalReviews: total,
      averageRating: avgResult.avgRating ? parseFloat(avgResult.avgRating).toFixed(1) : 0,
      distribution,
    };
  }

  // Get single review by ID (public)
  async getReviewById(id: string) {
    const review = await this.reviewRepository.findOne({
      where: { id, isPublic: true },
      relations: ['user', 'admin'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  // ============ USER APIs (Login required) ============

  // Create review (1 user = 1 review max)
  async createReview(userId: string, dto: CreateReviewDto): Promise<Review> {
    // Check if user already has a review
    const existing = await this.reviewRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('You have already submitted a review. Please update or delete it.');
    }

    const review = this.reviewRepository.create({
      userId,
      ...dto,
    });

    return await this.reviewRepository.save(review);
  }

  // Get my review
  async getMyReview(userId: string) {
    const review = await this.reviewRepository.findOne({
      where: { userId },
      relations: ['admin'],
    });

    if (!review) {
      throw new NotFoundException('You have not submitted a review yet');
    }

    return review;
  }

  // Update my review
  async updateMyReview(userId: string, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    Object.assign(review, dto);
    return await this.reviewRepository.save(review);
  }

  // Delete my review
  async deleteMyReview(userId: string) {
    const review = await this.reviewRepository.findOne({
      where: { userId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewRepository.remove(review);
    return { message: 'Review deleted successfully' };
  }

  // ============ ADMIN APIs ============

  // Get all reviews (including hidden)
  async getAllReviews(filter: ReviewFilterDto) {
    const { page = 1, limit = 20, rating, isPublic } = filter;
    const skip = (page - 1) * limit;

    const query = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.admin', 'admin');

    if (rating) {
      query.andWhere('review.rating = :rating', { rating });
    }

    if (isPublic !== undefined) {
      query.andWhere('review.isPublic = :isPublic', { isPublic });
    }

    const [items, total] = await query
      .orderBy('review.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Admin reply to review
  async adminReplyReview(adminId: string, reviewId: string, dto: AdminReplyDto): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.adminReply = dto.adminReply;
    review.repliedBy = adminId;
    review.repliedAt = new Date();

    return await this.reviewRepository.save(review);
  }

  // Admin update review (any field)
  async adminUpdateReview(reviewId: string, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    Object.assign(review, dto);
    return await this.reviewRepository.save(review);
  }

  // Admin toggle visibility
  async toggleVisibility(reviewId: string, isPublic: boolean): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.isPublic = isPublic;
    return await this.reviewRepository.save(review);
  }

  // Admin delete any review
  async adminDeleteReview(reviewId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewRepository.remove(review);
    return { message: 'Review deleted successfully' };
  }

  // Admin dashboard stats
  async getAdminStats() {
    const total = await this.reviewRepository.count();
    const publicCount = await this.reviewRepository.count({
      where: { isPublic: true },
    });
    const hiddenCount = total - publicCount;

    const needReply = await this.reviewRepository.count({
      where: { adminReply: null, isPublic: true },
    });

    const avgResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .getRawOne();

    // Rating distribution
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      const count = await this.reviewRepository.count({
        where: { rating: i },
      });
      distribution[i] = count;
    }

    return {
      totalReviews: total,
      publicReviews: publicCount,
      hiddenReviews: hiddenCount,
      needReply,
      averageRating: avgResult.avgRating ? parseFloat(avgResult.avgRating).toFixed(1) : 0,
      distribution,
    };
  }
}
