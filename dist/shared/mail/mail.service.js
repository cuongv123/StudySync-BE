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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
const config_1 = require("@nestjs/config");
let MailService = MailService_1 = class MailService {
    constructor(mailerService, configService) {
        this.mailerService = mailerService;
        this.configService = configService;
        this.logger = new common_1.Logger(MailService_1.name);
    }
    async sendVerificationEmail(email, otp, username) {
        const frontendUrl = this.configService.get('FRONTEND_URL');
        const expiryMinutes = this.configService.get('OTP_EXPIRY_MINUTES', 15);
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: '🔐 Verify Your StudySync Account',
                template: './verification',
                context: {
                    username,
                    otp,
                    expiryMinutes,
                    verifyUrl: `${frontendUrl}/verify-email?email=${encodeURIComponent(email)}`,
                    supportEmail: this.configService.get('MAIL_FROM'),
                    year: new Date().getFullYear(),
                },
            });
            this.logger.log(`Verification email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send verification email to ${email}:`, error);
            throw new Error('Failed to send verification email');
        }
    }
    async sendPasswordResetEmail(email, otp, username) {
        const frontendUrl = this.configService.get('FRONTEND_URL');
        const expiryMinutes = this.configService.get('OTP_EXPIRY_MINUTES', 15);
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: '🔑 Reset Your StudySync Password',
                template: './reset-password',
                context: {
                    username,
                    otp,
                    expiryMinutes,
                    resetUrl: `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}`,
                    supportEmail: this.configService.get('MAIL_FROM'),
                    year: new Date().getFullYear(),
                },
            });
            this.logger.log(`Password reset email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}:`, error);
            throw new Error('Failed to send password reset email');
        }
    }
    async sendPasswordChangedEmail(email, username) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: '✅ Password Changed Successfully',
                template: './password-changed',
                context: {
                    username,
                    supportEmail: this.configService.get('MAIL_FROM'),
                    year: new Date().getFullYear(),
                },
            });
            this.logger.log(`Password changed confirmation sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send password changed email to ${email}:`, error);
        }
    }
    async sendWelcomeEmail(email, username) {
        const frontendUrl = this.configService.get('FRONTEND_URL');
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: '🎉 Welcome to StudySync!',
                template: './welcome',
                context: {
                    username,
                    loginUrl: `${frontendUrl}/login`,
                    supportEmail: this.configService.get('MAIL_FROM'),
                    year: new Date().getFullYear(),
                },
            });
            this.logger.log(`Welcome email sent to ${email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send welcome email to ${email}:`, error);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map