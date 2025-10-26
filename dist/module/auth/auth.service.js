"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const User_service_1 = require("../User/User.service");
const token_service_1 = require("../token/token.service");
const mail_service_1 = require("../../shared/mail/mail.service");
const role_enum_1 = require("../../common/enums/role.enum");
let AuthService = class AuthService {
    constructor(usersService, tokenService, jwtService, mailService, configService) {
        this.usersService = usersService;
        this.tokenService = tokenService;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.configService = configService;
    }
    genJti() {
        return (0, crypto_1.randomBytes)(16).toString('hex');
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    getOTPExpiry() {
        const expiryMinutes = this.configService.get('OTP_EXPIRY_MINUTES', 15);
        return new Date(Date.now() + expiryMinutes * 60 * 1000);
    }
    async register(registerDto) {
        const existing = await this.usersService.findByEmail(registerDto.email);
        if (existing) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const otp = this.generateOTP();
        const otpExpiry = this.getOTPExpiry();
        const newUser = await this.usersService.create({
            email: registerDto.email,
            password: hashedPassword,
            username: registerDto.username,
            role: [role_enum_1.Role.USER],
            tokenOTP: otp,
            otpExpiry: otpExpiry,
            isVerified: false,
        });
        await this.mailService.sendVerificationEmail(newUser.email, otp, newUser.username);
        return {
            message: 'Registration successful. Please check your email to verify your account.',
            userId: newUser.id,
            email: newUser.email,
        };
    }
    async verifyEmail(verifyEmailDto) {
        const user = await this.usersService.findByEmail(verifyEmailDto.email);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        if (!user.tokenOTP || !user.otpExpiry) {
            throw new common_1.BadRequestException('No OTP found. Please request a new one.');
        }
        if (new Date() > user.otpExpiry) {
            throw new common_1.BadRequestException('OTP has expired. Please request a new one.');
        }
        if (user.tokenOTP !== verifyEmailDto.otp) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        user.isVerified = true;
        user.tokenOTP = null;
        user.otpExpiry = null;
        await this.usersService.update(user.id, user);
        await this.mailService.sendWelcomeEmail(user.email, user.username);
        return {
            message: 'Email verified successfully. You can now log in.',
        };
    }
    async resendOTP(resendOtpDto) {
        const user = await this.usersService.findByEmail(resendOtpDto.email);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException('Email already verified');
        }
        const otp = this.generateOTP();
        const otpExpiry = this.getOTPExpiry();
        user.tokenOTP = otp;
        user.otpExpiry = otpExpiry;
        await this.usersService.update(user.id, user);
        await this.mailService.sendVerificationEmail(user.email, otp, user.username);
        return {
            message: 'OTP has been resent to your email',
        };
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findByEmail(email);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.isVerified) {
            throw new common_1.UnauthorizedException('Please verify your email before logging in');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const { password: _ } = user, result = __rest(user, ["password"]);
        return result;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        return this.generateAndSaveTokens(user);
    }
    async generateAndSaveTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role, jti: this.genJti() };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(Object.assign(Object.assign({}, payload), { typ: 'refresh' }), { expiresIn: '7d' });
        const existingToken = await this.tokenService.findByUserId(user.id);
        await this.tokenService.create(user, {
            accessToken,
            refreshToken,
            refeshtokenused: (existingToken === null || existingToken === void 0 ? void 0 : existingToken.refeshtokenused) || [],
        });
        return { access_token: accessToken, refresh_token: refreshToken };
    }
    async forgotPassword(forgotPasswordDto) {
        const user = await this.usersService.findByEmail(forgotPasswordDto.email);
        if (!user) {
            return {
                message: 'If the email exists, a password reset code has been sent.',
            };
        }
        const otp = this.generateOTP();
        const otpExpiry = this.getOTPExpiry();
        user.tokenOTP = otp;
        user.otpExpiry = otpExpiry;
        await this.usersService.update(user.id, user);
        await this.mailService.sendPasswordResetEmail(user.email, otp, user.username);
        return {
            message: 'If the email exists, a password reset code has been sent.',
        };
    }
    async resetPasswordWithOTP(resetPasswordDto) {
        const user = await this.usersService.findByEmail(resetPasswordDto.email);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.tokenOTP || !user.otpExpiry) {
            throw new common_1.BadRequestException('No reset code found. Please request a new one.');
        }
        if (new Date() > user.otpExpiry) {
            throw new common_1.BadRequestException('Reset code has expired. Please request a new one.');
        }
        if (user.tokenOTP !== resetPasswordDto.otp) {
            throw new common_1.BadRequestException('Invalid reset code');
        }
        const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
        user.password = hashedPassword;
        user.tokenOTP = null;
        user.otpExpiry = null;
        await this.usersService.update(user.id, user);
        await this.tokenService.deleteByUserId(user.id);
        await this.mailService.sendPasswordChangedEmail(user.email, user.username);
        return {
            message: 'Password has been reset successfully. Please log in with your new password.',
        };
    }
    async refresh(refreshDto) {
        const refreshToken = refreshDto.refreshToken;
        let decoded;
        try {
            decoded = this.jwtService.verify(refreshToken);
        }
        catch (_a) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        if (decoded.typ !== 'refresh')
            throw new common_1.UnauthorizedException('Invalid token type');
        const userId = decoded.sub;
        const storedToken = await this.tokenService.findByRefreshToken(refreshToken);
        if (!storedToken)
            throw new common_1.UnauthorizedException('No refresh token found');
        if (storedToken.refeshtokenused.includes(refreshToken)) {
            await this.tokenService.deleteByUserId(userId);
            throw new common_1.UnauthorizedException('Token reuse detected. All sessions have been terminated.');
        }
        const user = await this.usersService.findOne(userId);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        await this.tokenService.addUsedRefreshToken(userId, refreshToken);
        const newTokens = await this.generateAndSaveTokens(user);
        return newTokens;
    }
    async logout(userId) {
        try {
            await this.tokenService.deleteByUserId(userId);
            return { message: 'Logged out successfully' };
        }
        catch (error) {
            console.error('Logout error:', error);
            throw new common_1.InternalServerErrorException('Failed to logout');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [User_service_1.UsersService,
        token_service_1.TokenService,
        jwt_1.JwtService,
        mail_service_1.MailService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map