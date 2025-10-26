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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscription = exports.SubscriptionStatus = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../User/entities/User.entity");
const subscription_plan_entity_1 = require("./subscription-plan.entity");
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["CANCELLED"] = "cancelled";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
let UserSubscription = class UserSubscription {
    isExpired() {
        if (!this.endDate)
            return false;
        return new Date() > this.endDate;
    }
    getDaysRemaining() {
        if (!this.endDate)
            return null;
        const now = new Date();
        const diffTime = this.endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }
    isExpiringSoon(days = 3) {
        const remaining = this.getDaysRemaining();
        return remaining !== null && remaining <= days && remaining > 0;
    }
    canUseAI() {
        if (!this.plan)
            return false;
        if (this.isExpired())
            return false;
        return this.usageAiQueries < this.plan.aiQueriesLimit;
    }
    canUseStorage(additionalMb) {
        if (!this.plan)
            return false;
        if (this.isExpired())
            return false;
        return (this.usagePersonalStorageMb + additionalMb) <= this.plan.personalStorageLimitMb;
    }
    canUseVideo(additionalMinutes) {
        if (!this.plan)
            return false;
        if (this.isExpired())
            return false;
        return (this.usageVideoMinutes + additionalMinutes) <= this.plan.videoCallMinutesLimit;
    }
    getRemainingAiQueries() {
        if (!this.plan || this.isExpired())
            return 0;
        return Math.max(0, this.plan.aiQueriesLimit - this.usageAiQueries);
    }
    getRemainingStorage() {
        if (!this.plan || this.isExpired())
            return 0;
        return Math.max(0, this.plan.personalStorageLimitMb - this.usagePersonalStorageMb);
    }
    getRemainingVideoMinutes() {
        if (!this.plan || this.isExpired())
            return 0;
        return Math.max(0, this.plan.videoCallMinutesLimit - this.usageVideoMinutes);
    }
    incrementAiUsage() {
        this.usageAiQueries += 1;
    }
    incrementStorageUsage(mb) {
        this.usagePersonalStorageMb += mb;
    }
    incrementVideoUsage(minutes) {
        this.usageVideoMinutes += minutes;
    }
    resetUsage() {
        this.usageAiQueries = 0;
        this.usagePersonalStorageMb = 0;
        this.usageVideoMinutes = 0;
        this.lastResetDate = new Date();
    }
    expire() {
        this.status = SubscriptionStatus.EXPIRED;
        this.isActive = false;
    }
    activate() {
        this.status = SubscriptionStatus.ACTIVE;
        this.isActive = true;
    }
    cancel() {
        this.status = SubscriptionStatus.CANCELLED;
        this.isActive = false;
    }
};
exports.UserSubscription = UserSubscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserSubscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], UserSubscription.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UserSubscription.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserSubscription.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], UserSubscription.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UserSubscription.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserSubscription.prototype, "autoRenew", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], UserSubscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], UserSubscription.prototype, "purchasedFromWallet", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        }
    }),
    __metadata("design:type", Number)
], UserSubscription.prototype, "usagePersonalStorageMb", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], UserSubscription.prototype, "usageVideoMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], UserSubscription.prototype, "usageAiQueries", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], UserSubscription.prototype, "lastResetDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_entity_1.User)
], UserSubscription.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_plan_entity_1.SubscriptionPlan, plan => plan.userSubscriptions),
    (0, typeorm_1.JoinColumn)({ name: 'planId' }),
    __metadata("design:type", subscription_plan_entity_1.SubscriptionPlan)
], UserSubscription.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UserSubscription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserSubscription.prototype, "updatedAt", void 0);
exports.UserSubscription = UserSubscription = __decorate([
    (0, typeorm_1.Entity)('user_subscriptions')
], UserSubscription);
//# sourceMappingURL=user-subscription.entity.js.map