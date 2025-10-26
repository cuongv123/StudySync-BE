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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./entities/review.entity");
let ReviewService = class ReviewService {
    constructor(reviewRepository) {
        this.reviewRepository = reviewRepository;
    }
    async getPublicReviews(filter) {
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
    async getReviewStats() {
        const total = await this.reviewRepository.count({
            where: { isPublic: true },
        });
        const avgResult = await this.reviewRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'avgRating')
            .where('review.isPublic = :isPublic', { isPublic: true })
            .getRawOne();
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
    async getReviewById(id) {
        const review = await this.reviewRepository.findOne({
            where: { id, isPublic: true },
            relations: ['user', 'admin'],
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async createReview(userId, dto) {
        const existing = await this.reviewRepository.findOne({
            where: { userId },
        });
        if (existing) {
            throw new common_1.ConflictException('You have already submitted a review. Please update or delete it.');
        }
        const review = this.reviewRepository.create(Object.assign({ userId }, dto));
        return await this.reviewRepository.save(review);
    }
    async getMyReview(userId) {
        const review = await this.reviewRepository.findOne({
            where: { userId },
            relations: ['admin'],
        });
        if (!review) {
            throw new common_1.NotFoundException('You have not submitted a review yet');
        }
        return review;
    }
    async updateMyReview(userId, dto) {
        const review = await this.reviewRepository.findOne({
            where: { userId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        Object.assign(review, dto);
        return await this.reviewRepository.save(review);
    }
    async deleteMyReview(userId) {
        const review = await this.reviewRepository.findOne({
            where: { userId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        await this.reviewRepository.remove(review);
        return { message: 'Review deleted successfully' };
    }
    async getAllReviews(filter) {
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
    async adminReplyReview(adminId, reviewId, dto) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        review.adminReply = dto.adminReply;
        review.repliedBy = adminId;
        review.repliedAt = new Date();
        return await this.reviewRepository.save(review);
    }
    async adminUpdateReview(reviewId, dto) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        Object.assign(review, dto);
        return await this.reviewRepository.save(review);
    }
    async toggleVisibility(reviewId, isPublic) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        review.isPublic = isPublic;
        return await this.reviewRepository.save(review);
    }
    async adminDeleteReview(reviewId) {
        const review = await this.reviewRepository.findOne({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        await this.reviewRepository.remove(review);
        return { message: 'Review deleted successfully' };
    }
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
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReviewService);
//# sourceMappingURL=review.service.js.map