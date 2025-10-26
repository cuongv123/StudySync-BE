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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_payment_entity_1 = require("../subscription/entities/subscription-payment.entity");
const subscription_plan_entity_1 = require("../subscription/entities/subscription-plan.entity");
const user_subscription_entity_1 = require("../subscription/entities/user-subscription.entity");
const payos_service_1 = require("../subscription/services/payos.service");
const config_1 = require("@nestjs/config");
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(paymentRepository, planRepository, subscriptionRepository, payosService, configService) {
        this.paymentRepository = paymentRepository;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.payosService = payosService;
        this.configService = configService;
        this.logger = new common_1.Logger(PaymentService_1.name);
    }
    async createSubscriptionPayment(userId, planId, userInfo) {
        const plan = await this.planRepository.findOne({
            where: { id: planId, isActive: true },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found');
        }
        if (plan.planName.toLowerCase() === 'free') {
            throw new common_1.BadRequestException('Cannot purchase FREE plan');
        }
        const existingSub = await this.subscriptionRepository.findOne({
            where: { userId, isActive: true },
            relations: ['plan'],
        });
        if (existingSub) {
            if (existingSub.id === 0) {
                this.logger.log(`User ${userId} upgrading from free to ${plan.planName}`);
            }
            else if (existingSub.planId === planId) {
                throw new common_1.BadRequestException('You already have this subscription plan');
            }
            else {
                this.logger.log(`User ${userId} upgrading from ${existingSub.plan.planName} to ${plan.planName}`);
            }
        }
        const orderCode = Number(Date.now().toString() + Math.floor(Math.random() * 1000).toString());
        this.logger.log(`Generated orderCode: ${orderCode}`);
        const payment = this.paymentRepository.create({
            userId,
            planId,
            orderCode: orderCode.toString(),
            amount: plan.price,
            status: subscription_payment_entity_1.PaymentStatus.PENDING,
        });
        await this.paymentRepository.save(payment);
        try {
            const paymentLink = await this.payosService.createPaymentLink({
                orderCode: orderCode.toString(),
                amount: plan.price,
                description: `Subscription: ${plan.planName} - ${plan.durationDays} days`,
                buyerName: userInfo.name || 'Guest',
                buyerEmail: userInfo.email || 'guest@studysync.com',
                buyerPhone: userInfo.phone || '0000000000',
                buyerAddress: 'N/A',
                items: [
                    {
                        name: `${plan.planName} Subscription`,
                        quantity: 1,
                        price: plan.price,
                    },
                ],
            });
            payment.checkoutUrl = paymentLink.checkoutUrl;
            payment.payosResponse = JSON.stringify(paymentLink);
            payment.paymentMethod = 'PAYOS';
            await this.paymentRepository.save(payment);
            return {
                orderCode,
                checkoutUrl: paymentLink.checkoutUrl,
                qrCode: paymentLink.qrCode,
                amount: plan.price,
                planName: plan.planName,
            };
        }
        catch (error) {
            payment.status = subscription_payment_entity_1.PaymentStatus.CANCELLED;
            await this.paymentRepository.save(payment);
            this.logger.error(`Failed to create payment link: ${error.message}`);
            throw new common_1.BadRequestException('Failed to create payment link');
        }
    }
    async handlePaymentWebhook(webhookData) {
        this.logger.log(`Processing webhook for order: ${webhookData.orderCode}`);
        const payment = await this.paymentRepository.findOne({
            where: { orderCode: String(webhookData.orderCode) },
            relations: ['plan'],
        });
        if (!payment) {
            this.logger.error(`Payment not found for order: ${webhookData.orderCode}`);
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status === subscription_payment_entity_1.PaymentStatus.PAID) {
            this.logger.log(`Payment already processed: ${webhookData.orderCode}`);
            return { message: 'Payment already processed' };
        }
        if (webhookData.code === '00' || webhookData.success) {
            payment.status = subscription_payment_entity_1.PaymentStatus.PAID;
            payment.paidAt = new Date();
            await this.paymentRepository.save(payment);
            await this.activateSubscription(payment.userId, payment.planId);
            this.logger.log(`Subscription activated for user: ${payment.userId}`);
            return { message: 'Subscription activated successfully' };
        }
        else {
            payment.status = subscription_payment_entity_1.PaymentStatus.CANCELLED;
            await this.paymentRepository.save(payment);
            this.logger.log(`Payment cancelled for order: ${webhookData.orderCode}`);
            return { message: 'Payment cancelled' };
        }
    }
    async activateSubscription(userId, planId) {
        const plan = await this.planRepository.findOne({
            where: { id: planId, isActive: true },
        });
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found');
        }
        const updated = await this.subscriptionRepository.update({ userId, isActive: true }, { isActive: false, status: user_subscription_entity_1.SubscriptionStatus.EXPIRED });
        if (updated.affected && updated.affected > 0) {
            this.logger.log(`Deactivated ${updated.affected} old subscription(s) for user ${userId}`);
        }
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.durationDays);
        const subscription = this.subscriptionRepository.create({
            userId,
            planId,
            startDate,
            endDate,
            isActive: true,
            autoRenew: false,
            status: user_subscription_entity_1.SubscriptionStatus.ACTIVE,
            purchasedFromWallet: false,
        });
        await this.subscriptionRepository.save(subscription);
        this.logger.log(`✅ New ${plan.planName} subscription activated for user ${userId}, expires at ${endDate.toISOString()}`);
    }
    async getUserPayments(userId) {
        return await this.paymentRepository.find({
            where: { userId },
            relations: ['plan'],
            order: { createdAt: 'DESC' },
        });
    }
    async getPaymentByOrderCode(orderCode) {
        const payment = await this.paymentRepository.findOne({
            where: { orderCode },
            relations: ['plan', 'user'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async verifyWebhookSignature(webhookData) {
        try {
            const isValid = this.payosService.verifyWebhookSignature(webhookData);
            if (isValid) {
                this.logger.log('✅ Webhook signature verified successfully');
            }
            else {
                this.logger.warn('❌ Invalid webhook signature');
            }
            return isValid;
        }
        catch (error) {
            this.logger.error(`Failed to verify webhook signature: ${error.message}`);
            return false;
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_payment_entity_1.SubscriptionPayment)),
    __param(1, (0, typeorm_1.InjectRepository)(subscription_plan_entity_1.SubscriptionPlan)),
    __param(2, (0, typeorm_1.InjectRepository)(user_subscription_entity_1.UserSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        payos_service_1.PayOSService,
        config_1.ConfigService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map