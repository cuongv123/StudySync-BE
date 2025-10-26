import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../User/User.service';
import { TokenService } from '../token/token.service';
import { MailService } from '../../shared/mail/mail.service';
import { Role } from 'src/common/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordWithOtpDto } from './dto/reset-password-with-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
export declare class AuthService {
    private usersService;
    private tokenService;
    private jwtService;
    private mailService;
    private configService;
    constructor(usersService: UsersService, tokenService: TokenService, jwtService: JwtService, mailService: MailService, configService: ConfigService);
    private genJti;
    private generateOTP;
    private getOTPExpiry;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        userId: string;
        email: string;
    }>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    resendOTP(resendOtpDto: ResendOtpDto): Promise<{
        message: string;
    }>;
    validateUser(email: string, pass: string): Promise<{
        id: string;
        email: string;
        username: string;
        isVerified: boolean;
        tokenOTP?: string | null;
        otpExpiry?: Date | null;
        role: Role[];
        isActive: boolean;
        phoneNumber?: string | null;
        studentId?: string | null;
        major?: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    private generateAndSaveTokens;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPasswordWithOTP(resetPasswordDto: ResetPasswordWithOtpDto): Promise<{
        message: string;
    }>;
    refresh(refreshDto: RefreshDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
}
