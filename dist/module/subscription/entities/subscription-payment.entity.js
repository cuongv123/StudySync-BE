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
exports.SubscriptionPayment = exports.PaymentMethod = exports.PaymentStatus = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../User/entities/User.entity");
const subscription_plan_entity_1 = require("./subscription-plan.entity");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["CANCELLED"] = "cancelled";
    PaymentStatus["EXPIRED"] = "expired";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["PAYOS"] = "PAYOS";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
let SubscriptionPayment = class SubscriptionPayment {
};
exports.SubscriptionPayment = SubscriptionPayment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment', { type: 'bigint' }),
    __metadata("design:type", Number)
], SubscriptionPayment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SubscriptionPayment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], SubscriptionPayment.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transactionId', unique: true }),
    __metadata("design:type", String)
], SubscriptionPayment.prototype, "orderCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric' }),
    __metadata("design:type", Number)
], SubscriptionPayment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paymentStatus', type: 'varchar' }),
    __metadata("design:type", String)
], SubscriptionPayment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paymentMethod', type: 'varchar', default: 'PAYOS' }),
    __metadata("design:type", String)
], SubscriptionPayment.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SubscriptionPayment.prototype, "checkoutUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gatewayResponse', type: 'text', nullable: true }),
    __metadata("design:type", String)
], SubscriptionPayment.prototype, "payosResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paymentDate', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SubscriptionPayment.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiresAt', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SubscriptionPayment.prototype, "expiredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'walletId', type: 'int4', nullable: true }),
    __metadata("design:type", Number)
], SubscriptionPayment.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'callbackData', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SubscriptionPayment.prototype, "callbackData", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_entity_1.User)
], SubscriptionPayment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_plan_entity_1.SubscriptionPlan, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'planId' }),
    __metadata("design:type", subscription_plan_entity_1.SubscriptionPlan)
], SubscriptionPayment.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SubscriptionPayment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SubscriptionPayment.prototype, "updatedAt", void 0);
exports.SubscriptionPayment = SubscriptionPayment = __decorate([
    (0, typeorm_1.Entity)('payments')
], SubscriptionPayment);
//# sourceMappingURL=subscription-payment.entity.js.map