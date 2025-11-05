import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AdminReplyDto } from './dto/admin-reply.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';
export declare class ReviewService {
    private reviewRepository;
    constructor(reviewRepository: Repository<Review>);
    getPublicReviews(filter: ReviewFilterDto): Promise<{
        items: Review[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        stats: {
            totalReviews: number;
            averageRating: string | number;
            distribution: {};
        };
    }>;
    getReviewStats(): Promise<{
        totalReviews: number;
        averageRating: string | number;
        distribution: {};
    }>;
    getReviewById(id: string): Promise<Review>;
    createReview(userId: string, dto: CreateReviewDto): Promise<Review>;
    getMyReview(userId: string): Promise<Review>;
    updateMyReview(userId: string, dto: UpdateReviewDto): Promise<Review>;
    deleteMyReview(userId: string): Promise<{
        message: string;
    }>;
    getAllReviews(filter: ReviewFilterDto): Promise<{
        items: Review[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    adminReplyReview(adminId: string, reviewId: string, dto: AdminReplyDto): Promise<Review>;
    adminUpdateReview(reviewId: string, dto: UpdateReviewDto): Promise<Review>;
    toggleVisibility(reviewId: string, isPublic: boolean): Promise<Review>;
    adminDeleteReview(reviewId: string): Promise<{
        message: string;
    }>;
    getAdminStats(): Promise<{
        totalReviews: number;
        publicReviews: number;
        hiddenReviews: number;
        needReply: number;
        averageRating: string | number;
        distribution: {};
    }>;
}
