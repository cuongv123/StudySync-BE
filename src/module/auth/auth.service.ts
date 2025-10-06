import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  private genJti() {
    return randomBytes(16).toString('hex');
  }

  /**
   * Generate 6-digit OTP
   */
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Get OTP expiry date
   */
  private getOTPExpiry(): Date {
    const expiryMinutes = this.configService.get<number>('OTP_EXPIRY_MINUTES', 15);
    return new Date(Date.now() + expiryMinutes * 60 * 1000);
  }

  /**
   * Register user và gửi email verification
   */
  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const otp = this.generateOTP();
    const otpExpiry = this.getOTPExpiry();

    const newUser = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      username: registerDto.username,
      role: [Role.USER],
      tokenOTP: otp,
      otpExpiry: otpExpiry,
      isVerified: false,
    });
    // Gửi email verification
    await this.mailService.sendVerificationEmail(
      newUser.email,
      otp,
      newUser.username,
    );

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: newUser.id,
      email: newUser.email,
    };
  }

  /**
   * Verify email với OTP
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.usersService.findByEmail(verifyEmailDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (!user.tokenOTP || !user.otpExpiry) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    if (new Date() > user.otpExpiry) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    if (user.tokenOTP !== verifyEmailDto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Verify thành công
    user.isVerified = true;
    user.tokenOTP = null;
    user.otpExpiry = null;
    await this.usersService.update(user.id, user);

    // Gửi email welcome
    await this.mailService.sendWelcomeEmail(user.email, user.username);

    return {
      message: 'Email verified successfully. You can now log in.',
    };
  }

  /**
   * Resend OTP
   */
  async resendOTP(resendOtpDto: ResendOtpDto) {
    const user = await this.usersService.findByEmail(resendOtpDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
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

  /**
   * Validate user (chỉ cho phép login nếu đã verify email)
   */
  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const { password: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return this.generateAndSaveTokens(user);
  }

  private async generateAndSaveTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role, jti: this.genJti() };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign({ ...payload, typ: 'refresh' }, { expiresIn: '7d' });

    // Get existing token to preserve history
    const existingToken = await this.tokenService.findByUserId(user.id);

    await this.tokenService.create(user, {
      accessToken,
      refreshToken,
      refeshtokenused: existingToken?.refeshtokenused || [],
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  /**
   * Forgot password - gửi OTP qua email
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Không tiết lộ thông tin user có tồn tại hay không
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

  /**
   * Reset password với OTP
   */
  async resetPasswordWithOTP(resetPasswordDto: ResetPasswordWithOtpDto) {
    const user = await this.usersService.findByEmail(resetPasswordDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.tokenOTP || !user.otpExpiry) {
      throw new BadRequestException('No reset code found. Please request a new one.');
    }

    if (new Date() > user.otpExpiry) {
      throw new BadRequestException('Reset code has expired. Please request a new one.');
    }

    if (user.tokenOTP !== resetPasswordDto.otp) {
      throw new BadRequestException('Invalid reset code');
    }

    // Reset password thành công
    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.password = hashedPassword;
    user.tokenOTP = null;
    user.otpExpiry = null;
    await this.usersService.update(user.id, user);

    // Xóa tất cả token hiện tại (force logout)
    await this.tokenService.deleteByUserId(user.id);

    // Gửi email xác nhận
    await this.mailService.sendPasswordChangedEmail(user.email, user.username);

    return {
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  async refresh(refreshDto: RefreshDto) {
    const refreshToken = refreshDto.refreshToken;
    let decoded: any;
    try {
      decoded = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (decoded.typ !== 'refresh') throw new UnauthorizedException('Invalid token type');

    const userId = decoded.sub;

    const storedToken = await this.tokenService.findByRefreshToken(refreshToken);
    if (!storedToken) throw new UnauthorizedException('No refresh token found');

    if (storedToken.refeshtokenused.includes(refreshToken)) {
      // Token reuse detected - possible attack
      await this.tokenService.deleteByUserId(userId);
      throw new UnauthorizedException('Token reuse detected. All sessions have been terminated.');
    }

    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.tokenService.addUsedRefreshToken(userId, refreshToken);

    const newTokens = await this.generateAndSaveTokens(user);

    return newTokens;
  }

  async logout(userId: string) {
    try {
      await this.tokenService.deleteByUserId(userId);
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      throw new InternalServerErrorException('Failed to logout');
    }
  }
}