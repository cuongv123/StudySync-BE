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
var PayOSService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayOSService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_1 = require("@payos/node");
let PayOSService = PayOSService_1 = class PayOSService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PayOSService_1.name);
        const clientId = this.configService.get('CLIENT_ID');
        const apiKey = this.configService.get('API_KEY');
        const checksumKey = this.configService.get('CHECKSUM_KEY');
        if (!clientId || !apiKey || !checksumKey) {
            throw new Error('PayOS credentials are missing in environment variables');
        }
        this.payOS = new node_1.PayOS({
            clientId,
            apiKey,
            checksumKey,
        });
        this.logger.log('PayOS Service initialized successfully');
    }
    async createPaymentLink(data) {
        try {
            const paymentData = {
                orderCode: Number(data.orderCode),
                amount: Number(data.amount),
                description: data.description,
                buyerName: data.buyerName,
                buyerEmail: data.buyerEmail,
                buyerPhone: data.buyerPhone,
                buyerAddress: data.buyerAddress || 'N/A',
                buyerCompanyName: data.buyerCompanyName,
                buyerTaxCode: data.buyerTaxCode,
                items: data.items,
                returnUrl: data.returnUrl || `${this.configService.get('APP_URL')}/subscription/success`,
                cancelUrl: data.cancelUrl || `${this.configService.get('APP_URL')}/subscription/cancel`,
                expiredAt: Math.floor(Date.now() / 1000) + 15 * 60,
            };
            this.logger.log(`Creating payment link for order: ${data.orderCode}`);
            const response = await this.payOS.paymentRequests.create(paymentData);
            this.logger.log(`Payment link created successfully: ${response.checkoutUrl}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to create payment link: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to create payment link: ${error.message}`);
        }
    }
    async getPaymentInfo(orderCode) {
        try {
            const response = await this.payOS.paymentRequests.get(Number(orderCode));
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to get payment info: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to get payment info: ${error.message}`);
        }
    }
    async cancelPaymentLink(orderCode, reason) {
        try {
            const response = await this.payOS.paymentRequests.cancel(Number(orderCode), reason);
            this.logger.log(`Payment link cancelled: ${orderCode}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to cancel payment: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to cancel payment: ${error.message}`);
        }
    }
    verifyWebhookSignature(webhookData) {
        try {
            const isValid = this.payOS.verifyPaymentWebhookData(webhookData);
            if (isValid) {
                this.logger.log('✅ Webhook signature is valid');
            }
            else {
                this.logger.warn('❌ Webhook signature is invalid');
            }
            return isValid;
        }
        catch (error) {
            this.logger.error(`Webhook verification failed: ${error.message}`);
            return false;
        }
    }
};
exports.PayOSService = PayOSService;
exports.PayOSService = PayOSService = PayOSService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PayOSService);
//# sourceMappingURL=payos.service.js.map