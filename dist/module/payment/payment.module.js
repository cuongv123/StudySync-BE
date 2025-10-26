"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const payment_controller_1 = require("./payment.controller");
const payment_service_1 = require("./payment.service");
const subscription_payment_entity_1 = require("../subscription/entities/subscription-payment.entity");
const subscription_plan_entity_1 = require("../subscription/entities/subscription-plan.entity");
const user_subscription_entity_1 = require("../subscription/entities/user-subscription.entity");
const payos_service_1 = require("../subscription/services/payos.service");
const jwt_auth_strategies_1 = require("../auth/strategies/jwt.auth.strategies");
let PaymentModule = class PaymentModule {
};
exports.PaymentModule = PaymentModule;
exports.PaymentModule = PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                subscription_payment_entity_1.SubscriptionPayment,
                subscription_plan_entity_1.SubscriptionPlan,
                user_subscription_entity_1.UserSubscription,
            ]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            config_1.ConfigModule,
        ],
        controllers: [payment_controller_1.PaymentController],
        providers: [
            jwt_auth_strategies_1.JwtStrategy,
            payment_service_1.PaymentService,
            payos_service_1.PayOSService,
        ],
        exports: [payment_service_1.PaymentService],
    })
], PaymentModule);
//# sourceMappingURL=payment.module.js.map