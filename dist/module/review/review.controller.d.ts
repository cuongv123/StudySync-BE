import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AdminReplyDto } from './dto/admin-reply.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';
export declare class ReviewController {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    getPublicReviews(filter: ReviewFilterDto): Promise<{
        data: {
            items: import("./entities/review.entity").Review[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            stats: {
                totalReviews: number;
                averageRating: string | number;
                distribution: {};
            };
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getReviewStats(): Promise<{
        data: {
            totalReviews: number;
            averageRating: string | number;
            distribution: {};
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getReviewById(id: string): Promise<{
        data: import("./entities/review.entity").Review;
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    createReview(req: any, dto: CreateReviewDto): Promise<{
        data: import("./entities/review.entity").Review;
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getMyReview(req: any): Promise<{
        data: import("./entities/review.entity").Review;
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    updateMyReview(req: any, dto: UpdateReviewDto): Promise<{
        data: import("./entities/review.entity").Review;
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    deleteMyReview(req: any): Promise<{
        data: {
            message: string;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getAllReviews(filter: ReviewFilterDto): Promise<{
        data: {
            items: import("./entities/review.entity").Review[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    adminReplyReview(req: any, id: string, dto: AdminReplyDto): Promise<{
        data: import("./entities/review.entity").Review;
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    adminUpdateReview(id: string, dto: UpdateReviewDto): Promise<{
        data: import("./entities/review.entity").Review;
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    toggleVisibility(id: string, isPublic: boolean): Promise<{
        data: import("./entities/review.entity").Review;
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    adminDeleteReview(id: string): Promise<{
        data: {
            message: string;
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
    getAdminStats(): Promise<{
        data: {
            totalReviews: number;
            publicReviews: number;
            hiddenReviews: number;
            needReply: number;
            averageRating: string | number;
            distribution: {};
        };
        statusCode: number;
        message: string;
        timestamp: string;
    }>;
}
