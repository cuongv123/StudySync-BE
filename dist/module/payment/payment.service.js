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
const schedule_1 = require("@nestjs/schedule");
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
        var _a;
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
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderCodeStr = timestamp.slice(-14) + random;
        const orderCode = Number(orderCodeStr);
        this.logger.log(`Generated orderCode: ${orderCode} (length: ${orderCodeStr.length})`);
        this.logger.log(`User info for payment: ${JSON.stringify(userInfo)}`);
        this.logger.log(`Plan details: ${plan.planName}, Price: ${plan.price}`);
        if (!plan.price || plan.price <= 0) {
            throw new common_1.BadRequestException('Invalid plan price');
        }
        const payment = this.paymentRepository.create({
            userId,
            planId,
            orderCode: orderCode.toString(),
            amount: plan.price,
            status: subscription_payment_entity_1.PaymentStatus.PENDING,
        });
        await this.paymentRepository.save(payment);
        try {
            const description = `${plan.planName} - ${plan.durationDays}d`.slice(0, 25);
            const paymentLink = await this.payosService.createPaymentLink({
                orderCode: orderCode.toString(),
                amount: plan.price,
                description: description,
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
            this.logger.error(`Failed to create payment link for orderCode ${orderCode}`);
            this.logger.error(`Error message: ${error.message}`);
            this.logger.error(`Error details: ${JSON.stringify(((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error)}`);
            this.logger.error(`Stack trace: ${error.stack}`);
            const errorMessage = error.message || 'Unknown error from PayOS';
            throw new common_1.BadRequestException(`Failed to create payment link: ${errorMessage}`);
        }
    }
    async handlePaymentWebhook(webhookData) {
        var _a;
        this.logger.log('=== Webhook Data Received ===');
        this.logger.log(JSON.stringify(webhookData, null, 2));
        const orderCode = webhookData.orderCode || ((_a = webhookData.data) === null || _a === void 0 ? void 0 : _a.orderCode) || webhookData.order_code;
        this.logger.log(`Processing webhook for order: ${orderCode}`);
        if (!orderCode) {
            this.logger.error('OrderCode is missing in webhook data!');
            this.logger.error('Webhook keys:', Object.keys(webhookData));
            throw new common_1.BadRequestException('OrderCode is required');
        }
        const payment = await this.paymentRepository.findOne({
            where: { orderCode: String(orderCode) },
            relations: ['plan'],
        });
        if (!payment) {
            this.logger.error(`Payment not found for order: ${orderCode}`);
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.status === subscription_payment_entity_1.PaymentStatus.PAID) {
            this.logger.log(`Payment already processed: ${orderCode}`);
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
            where: { orderCode: orderCode },
            relations: ['plan'],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async getPayOSTransactionInfo(orderCode) {
        var _a, _b, _c, _d;
        try {
            this.logger.log(`Fetching transaction info from PayOS for order: ${orderCode}`);
            const payment = await this.paymentRepository.findOne({
                where: { orderCode: orderCode },
                relations: ['plan'],
            });
            if (!payment) {
                this.logger.error(`Payment not found in database for order: ${orderCode}`);
                throw new common_1.NotFoundException('Mã thanh toán không tồn tại trong hệ thống. Vui lòng tạo payment mới.');
            }
            let payosInfo = null;
            try {
                payosInfo = await this.payosService.getPaymentInfo(orderCode);
            }
            catch (payosError) {
                this.logger.warn(`PayOS API error for order ${orderCode}: ${payosError.message}`);
                if (((_a = payosError.message) === null || _a === void 0 ? void 0 : _a.includes('không tồn tại')) || ((_b = payosError.message) === null || _b === void 0 ? void 0 : _b.includes('code: 101'))) {
                    this.logger.warn(`Payment link expired or cancelled on PayOS for order: ${orderCode}`);
                    return {
                        orderCode: payment.orderCode,
                        amount: payment.amount,
                        status: 'EXPIRED_OR_NOT_FOUND_ON_PAYOS',
                        message: 'Payment link không tồn tại trên PayOS (có thể đã hết hạn hoặc bị hủy). Vui lòng tạo payment mới.',
                        paymentRecord: {
                            id: payment.id,
                            userId: payment.userId,
                            planId: payment.planId,
                            planName: (_c = payment.plan) === null || _c === void 0 ? void 0 : _c.planName,
                            status: payment.status,
                            paidAt: payment.paidAt,
                            createdAt: payment.createdAt,
                        },
                    };
                }
                throw payosError;
            }
            return {
                orderCode: payosInfo.orderCode,
                amount: payosInfo.amount,
                description: payosInfo.description,
                status: payosInfo.status,
                currency: payosInfo.currency || 'VND',
                paymentLinkId: payosInfo.paymentLinkId,
                checkoutUrl: payosInfo.checkoutUrl,
                qrCode: payosInfo.qrCode,
                transactions: payosInfo.transactions || [],
                paymentRecord: {
                    id: payment.id,
                    userId: payment.userId,
                    planId: payment.planId,
                    planName: (_d = payment.plan) === null || _d === void 0 ? void 0 : _d.planName,
                    status: payment.status,
                    paidAt: payment.paidAt,
                    createdAt: payment.createdAt,
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to get transaction info: ${error.message}`);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.NotFoundException(`Không thể lấy thông tin thanh toán. Lỗi: ${error.message || 'Unknown error'}`);
        }
    }
    async verifyWebhookSignature(webhookData) {
        try {
            const isValid = this.payosService.verifyWebhookSignature(webhookData);
            if (isValid) {
                this.logger.log(' Webhook signature verified successfully');
            }
            else {
                this.logger.warn(' Invalid webhook signature');
            }
            return isValid;
        }
        catch (error) {
            this.logger.error(`Failed to verify webhook signature: ${error.message}`);
            return false;
        }
    }
    async cancelPayment(userId, orderCode) {
        const payment = await this.paymentRepository.findOne({
            where: { orderCode },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        if (payment.userId !== userId) {
            throw new common_1.BadRequestException('You are not authorized to cancel this payment');
        }
        if (payment.status !== subscription_payment_entity_1.PaymentStatus.PENDING) {
            throw new common_1.BadRequestException(`Cannot cancel payment with status: ${payment.status}`);
        }
        try {
            await this.payosService.cancelPaymentLink(orderCode, 'Cancelled by user');
            this.logger.log(` Payment link cancelled on PayOS: ${orderCode}`);
        }
        catch (error) {
            this.logger.warn(` Failed to cancel on PayOS (may already be expired): ${error.message}`);
        }
        payment.status = subscription_payment_entity_1.PaymentStatus.CANCELLED;
        await this.paymentRepository.save(payment);
        this.logger.log(` Payment cancelled by user ${userId}: ${orderCode}`);
        return { message: 'Payment cancelled successfully' };
    }
    async expireOldPendingPayments() {
        try {
            this.logger.log(' Running cron job: Expire old pending payments');
            const fifteenMinutesAgo = new Date();
            fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
            const expiredPayments = await this.paymentRepository.find({
                where: {
                    status: subscription_payment_entity_1.PaymentStatus.PENDING,
                    createdAt: (0, typeorm_2.LessThan)(fifteenMinutesAgo),
                },
            });
            if (expiredPayments.length === 0) {
                this.logger.log(' No expired payments found');
                return;
            }
            const orderCodes = expiredPayments.map(p => p.orderCode);
            await this.paymentRepository.update({
                status: subscription_payment_entity_1.PaymentStatus.PENDING,
                createdAt: (0, typeorm_2.LessThan)(fifteenMinutesAgo)
            }, {
                status: subscription_payment_entity_1.PaymentStatus.EXPIRED
            });
            this.logger.log(` Expired ${expiredPayments.length} pending payments: ${orderCodes.join(', ')}`);
        }
        catch (error) {
            this.logger.error(` Failed to expire old payments: ${error.message}`);
        }
    }
};
exports.PaymentService = PaymentService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentService.prototype, "expireOldPendingPayments", null);
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