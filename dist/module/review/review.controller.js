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
exports.ReviewController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
const RolesGuard_1 = require("../auth/guards/RolesGuard");
const roles_decorator_1 = require("../../decorator/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const review_service_1 = require("./review.service");
const create_review_dto_1 = require("./dto/create-review.dto");
const update_review_dto_1 = require("./dto/update-review.dto");
const admin_reply_dto_1 = require("./dto/admin-reply.dto");
const review_filter_dto_1 = require("./dto/review-filter.dto");
let ReviewController = class ReviewController {
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    async getPublicReviews(filter) {
        const result = await this.reviewService.getPublicReviews(filter);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async getReviewStats() {
        const result = await this.reviewService.getReviewStats();
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async getReviewById(id) {
        const result = await this.reviewService.getReviewById(id);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async createReview(req, dto) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.reviewService.createReview(userId, dto);
        return {
            data: result,
            statusCode: 201,
            message: 'Review created successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async getMyReview(req) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.reviewService.getMyReview(userId);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async updateMyReview(req, dto) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.reviewService.updateMyReview(userId, dto);
        return {
            data: result,
            statusCode: 200,
            message: 'Review updated successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async deleteMyReview(req) {
        var _a, _b, _c;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.reviewService.deleteMyReview(userId);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async getAllReviews(filter) {
        const result = await this.reviewService.getAllReviews(filter);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async adminReplyReview(req, id, dto) {
        var _a, _b, _c;
        const adminId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.sub);
        const result = await this.reviewService.adminReplyReview(adminId, id, dto);
        return {
            data: result,
            statusCode: 200,
            message: 'Reply added successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async adminUpdateReview(id, dto) {
        const result = await this.reviewService.adminUpdateReview(id, dto);
        return {
            data: result,
            statusCode: 200,
            message: 'Review updated successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async toggleVisibility(id, isPublic) {
        const result = await this.reviewService.toggleVisibility(id, isPublic);
        return {
            data: result,
            statusCode: 200,
            message: 'Visibility updated successfully',
            timestamp: new Date().toISOString(),
        };
    }
    async adminDeleteReview(id) {
        const result = await this.reviewService.adminDeleteReview(id);
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async getAdminStats() {
        const result = await this.reviewService.getAdminStats();
        return {
            data: result,
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.ReviewController = ReviewController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all public reviews' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns public reviews with stats' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_filter_dto_1.ReviewFilterDto]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getPublicReviews", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get review statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns review stats' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getReviewStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get single review by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns review detail' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getReviewById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create review (User - 1 review per user)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Review created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already has a review' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_review_dto_1.CreateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "createReview", null);
__decorate([
    (0, common_1.Get)('my-review/detail'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my review (User)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns user review' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'No review found' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getMyReview", null);
__decorate([
    (0, common_1.Put)('my-review'),
    (0, swagger_1.ApiOperation)({ summary: 'Update my review (User)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review updated successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_review_dto_1.UpdateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "updateMyReview", null);
__decorate([
    (0, common_1.Delete)('my-review'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete my review (User)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review deleted successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "deleteMyReview", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(RolesGuard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reviews (Admin - including hidden)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns all reviews' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [review_filter_dto_1.ReviewFilterDto]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getAllReviews", null);
__decorate([
    (0, common_1.Put)('admin/:id/reply'),
    (0, common_1.UseGuards)(RolesGuard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin reply to review' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reply added successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_reply_dto_1.AdminReplyDto]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "adminReplyReview", null);
__decorate([
    (0, common_1.Put)('admin/:id'),
    (0, common_1.UseGuards)(RolesGuard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin update review (any field)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_review_dto_1.UpdateReviewDto]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "adminUpdateReview", null);
__decorate([
    (0, common_1.Put)('admin/:id/visibility'),
    (0, common_1.UseGuards)(RolesGuard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin toggle review visibility (hide/show)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Visibility updated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isPublic')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "toggleVisibility", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.UseGuards)(RolesGuard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Admin delete any review' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "adminDeleteReview", null);
__decorate([
    (0, common_1.Get)('admin/dashboard/stats'),
    (0, common_1.UseGuards)(RolesGuard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get admin dashboard stats' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns admin statistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReviewController.prototype, "getAdminStats", null);
exports.ReviewController = ReviewController = __decorate([
    (0, swagger_1.ApiTags)('Reviews'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('reviews'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [review_service_1.ReviewService])
], ReviewController);
//# sourceMappingURL=review.controller.js.map