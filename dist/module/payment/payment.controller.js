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
var PaymentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
const payment_service_1 = require("./payment.service");
const purchase_subscription_dto_1 = require("./dto/purchase-subscription.dto");
let PaymentController = PaymentController_1 = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
        this.logger = new common_1.Logger(PaymentController_1.name);
    }
    async purchaseSubscription(req, purchaseDto) {
        var _a;
        try {
            this.logger.log('=== Purchase Request ===');
            this.logger.log('req.user:', JSON.stringify(req.user));
            this.logger.log('purchaseDto:', JSON.stringify(purchaseDto));
            if (!req.user || !req.user.sub) {
                throw new common_1.BadRequestException('User not authenticated. Please login again.');
            }
            const paymentData = await this.paymentService.createSubscriptionPayment(req.user.sub, purchaseDto.planId, {
                name: purchaseDto.name || req.user.username || ((_a = req.user.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || 'User',
                email: purchaseDto.email || req.user.email || 'user@studysync.com',
                phone: purchaseDto.phone || req.user.phone || '0000000000',
            });
            return {
                data: paymentData,
                statusCode: 200,
                message: 'Payment link created successfully. Please scan QR code to pay.',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Purchase error:', error.message);
            throw new common_1.BadRequestException(error.message);
        }
    }
    async handlePayOSWebhook(req, res) {
        this.logger.log('=== PayOS Webhook START ===');
        try {
            const body = req.body || {};
            this.logger.log('Webhook Body:', JSON.stringify(body));
            if (!body || Object.keys(body).length === 0) {
                this.logger.log('✅ Empty body - PayOS test');
                return res.status(200).json({ success: true, message: 'Webhook OK' });
            }
            const result = await this.paymentService.handlePaymentWebhook(body);
            this.logger.log('✅ Webhook processed');
            return res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            this.logger.error('❌ Webhook error:', error.message);
            return res.status(200).json({ success: false, error: error.message });
        }
    }
    async getPaymentHistory(req) {
        return {
            data: await this.paymentService.getUserPayments(req.user.sub),
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
    async getPaymentByOrderCode(req, orderCode) {
        return {
            data: await this.paymentService.getPaymentByOrderCode(orderCode),
            statusCode: 200,
            message: 'Success',
            timestamp: new Date().toISOString(),
        };
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('purchase'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Purchase subscription with PayOS' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns PayOS checkout URL with QR code' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, purchase_subscription_dto_1.PurchaseSubscriptionDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "purchaseSubscription", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'PayOS webhook endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handlePayOSWebhook", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user payment history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns user payment history' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPaymentHistory", null);
__decorate([
    (0, common_1.Get)('detail'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment details by order code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns payment details' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('orderCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPaymentByOrderCode", null);
exports.PaymentController = PaymentController = PaymentController_1 = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map