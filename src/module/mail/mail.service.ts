import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Gửi email xác thực với OTP
   */
  async sendVerificationEmail(email: string, otp: string, username: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const expiryMinutes = this.configService.get<number>('OTP_EXPIRY_MINUTES', 15);
    console.log(2);
    try {
      console.log(3);
      await this.mailerService.sendMail({
        to: email,
        subject: '🔐 Verify Your StudySync Account',
        template: './verification',
        context: {
          username,
          otp,
          expiryMinutes,
          verifyUrl: `${frontendUrl}/verify-email?email=${encodeURIComponent(email)}`,
          supportEmail: this.configService.get<string>('MAIL_FROM'),
          year: new Date().getFullYear(),
        },
      });
      console.log(4);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.log(5);
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Gửi email reset password với OTP
   */
  async sendPasswordResetEmail(email: string, otp: string, username: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const expiryMinutes = this.configService.get<number>('OTP_EXPIRY_MINUTES', 15);

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
          supportEmail: this.configService.get<string>('MAIL_FROM'),
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Gửi email thông báo đổi password thành công
   */
  async sendPasswordChangedEmail(email: string, username: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '✅ Password Changed Successfully',
        template: './password-changed',
        context: {
          username,
          supportEmail: this.configService.get<string>('MAIL_FROM'),
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Password changed confirmation sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password changed email to ${email}:`, error);
    }
  }

  /**
   * Gửi email chào mừng sau khi verify thành công
   */
  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: '🎉 Welcome to StudySync!',
        template: './welcome',
        context: {
          username,
          loginUrl: `${frontendUrl}/login`,
          supportEmail: this.configService.get<string>('MAIL_FROM'),
          year: new Date().getFullYear(),
        },
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
    }
  }
}