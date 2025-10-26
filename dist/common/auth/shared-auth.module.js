"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedAuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const jwt_auth_strategies_1 = require("../../module/auth/strategies/jwt.auth.strategies");
let SharedAuthModule = class SharedAuthModule {
};
exports.SharedAuthModule = SharedAuthModule;
exports.SharedAuthModule = SharedAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET') || 'super_secret_key',
                    signOptions: { expiresIn: '1d' },
                }),
            }),
        ],
        providers: [jwt_auth_strategies_1.JwtStrategy],
        exports: [passport_1.PassportModule, jwt_1.JwtModule, jwt_auth_strategies_1.JwtStrategy],
    })
], SharedAuthModule);
//# sourceMappingURL=shared-auth.module.js.map