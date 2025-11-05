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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const User_service_1 = require("../User/User.service");
const review_service_1 = require("../review/review.service");
const subscription_payment_entity_1 = require("../subscription/entities/subscription-payment.entity");
const user_subscription_entity_1 = require("../subscription/entities/user-subscription.entity");
const subscription_plan_entity_1 = require("../subscription/entities/subscription-plan.entity");
let AdminService = class AdminService {
    constructor(usersService, reviewService, paymentRepository, userSubscriptionRepository, planRepository) {
        this.usersService = usersService;
        this.reviewService = reviewService;
        this.paymentRepository = paymentRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
        this.planRepository = planRepository;
    }
    async getAdminProfile(adminId) {
        return this.usersService.findOne(adminId);
    }
    async getDashboard() {
        var _a, _b;
        const totalUsers = await this.usersService.findAll();
        const totalRevenue = await this.getTotalRevenue();
        const subscriptionStats = await this.getSubscriptionStats();
        const reviewStats = await ((_b = (_a = this.reviewService).getAdminStats) === null || _b === void 0 ? void 0 : _b.call(_a));
        return {
            totalUsers: Array.isArray(totalUsers) ? totalUsers.length : 0,
            totalRevenue: totalRevenue.total,
            subscriptionStats,
            reviewStats: reviewStats || {},
        };
    }
    async listUsers(adminId, query) {
        const allUsers = await this.usersService.findAll();
        return Array.isArray(allUsers)
            ? allUsers.filter(user => user.id !== adminId)
            : [];
    }
    async getUserById(id) {
        return this.usersService.findOne(id);
    }
    async resetUserPassword(id, newPassword) {
        return this.usersService.resetPassword(id, newPassword);
    }
    async deleteUser(id) {
        return this.usersService.remove(id);
    }
    async assignRole(userId, role) {
        return this.usersService.assignRole(userId, role);
    }
    async getTotalRevenue() {
        const result = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.status = :status', { status: subscription_payment_entity_1.PaymentStatus.PAID })
            .getRawOne();
        return {
            total: parseFloat(result === null || result === void 0 ? void 0 : result.total) || 0,
            currency: 'VND',
        };
    }
    async getSubscriptionStats() {
        const plans = await this.planRepository.find();
        const stats = await Promise.all(plans.map(async (plan) => {
            const count = await this.userSubscriptionRepository.count({
                where: { planId: plan.id, isActive: true },
            });
            return {
                planName: plan.planName,
                planId: plan.id,
                activeSubscriptions: count,
            };
        }));
        return {
            byPlan: stats,
            total: stats.reduce((sum, stat) => sum + stat.activeSubscriptions, 0),
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_payment_entity_1.SubscriptionPayment)),
    __param(3, (0, typeorm_1.InjectRepository)(user_subscription_entity_1.UserSubscription)),
    __param(4, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __metadata("design:paramtypes", [User_service_1.UsersService,
        review_service_1.ReviewService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map