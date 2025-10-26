"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_auth_strategies_1 = require("./strategies/jwt.auth.strategies");
const User_module_1 = require("../User/User.module");
const token_module_1 = require("../token/token.module");
const mail_module_1 = require("../../shared/mail/mail.module");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            User_module_1.UserModule,
            token_module_1.TokenModule,
            mail_module_1.MailModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET') || (() => {
                        throw new Error('JWT_SECRET environment variable is not set');
                    })(),
                    signOptions: { expiresIn: '1d' },
                }),
            }),
        ],
        providers: [auth_service_1.AuthService, jwt_auth_strategies_1.JwtStrategy],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, jwt_auth_strategies_1.JwtStrategy, passport_1.PassportModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map