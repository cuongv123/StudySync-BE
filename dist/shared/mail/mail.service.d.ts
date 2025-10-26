import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private mailerService;
    private configService;
    private readonly logger;
    constructor(mailerService: MailerService, configService: ConfigService);
    sendVerificationEmail(email: string, otp: string, username: string): Promise<void>;
    sendPasswordResetEmail(email: string, otp: string, username: string): Promise<void>;
    sendPasswordChangedEmail(email: string, username: string): Promise<void>;
    sendWelcomeEmail(email: string, username: string): Promise<void>;
}
