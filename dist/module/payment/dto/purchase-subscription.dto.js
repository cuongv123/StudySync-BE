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
exports.PurchaseSubscriptionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class PurchaseSubscriptionDto {
}
exports.PurchaseSubscriptionDto = PurchaseSubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Subscription plan ID',
        example: 1
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PurchaseSubscriptionDto.prototype, "planId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Buyer name',
        example: 'Nguyen Van A',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PurchaseSubscriptionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Buyer email',
        example: 'user@example.com',
        required: false
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PurchaseSubscriptionDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Buyer phone',
        example: '0912345678',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PurchaseSubscriptionDto.prototype, "phone", void 0);
//# sourceMappingURL=purchase-subscription.dto.js.map