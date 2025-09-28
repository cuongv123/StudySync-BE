// auth.service.ts (thêm inject TokenService, logic refresh/logout)
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../User/User.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from 'src/common/enums/role.enum';
import { TokenService } from '../token/token.service'; // Thêm

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService, // Thêm
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string; userId: string }> {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      username: registerDto.username,
      role: [Role.USER],
    });

    // Generate và lưu tokens đơn giản sau register (optional, hoặc chỉ login)
    await this.generateAndSaveTokens(newUser);

    return { message: 'Register success', userId: newUser.id };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: pwd, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return this.generateAndSaveTokens(user);
  }

  private async generateAndSaveTokens(user: any): Promise<{ access_token: string; refresh_token: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' }); // Short-lived
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' }); // Long-lived

    // Lưu token đơn giản vào DB
    await this.tokenService.create(user, {
      accessToken,
      refreshToken,
      refeshtokenused: [], // Init empty
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const token = await this.tokenService.findByRefreshToken(refreshToken);
    if (!token) throw new UnauthorizedException('Invalid refresh token');

    // Check nếu đã used (ngăn replay)
    if (token.refeshtokenused.includes(refreshToken)) {
      throw new UnauthorizedException('Refresh token already used');
    }

    // Verify JWT refresh (nếu expire hoặc invalid)
    try {
      this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const newTokens = await this.generateAndSaveTokens(token.user);

    // Add old refresh to used
    await this.tokenService.addUsedRefreshToken(token.user.id, refreshToken);

    return newTokens;
  }

  async logout(userId: string): Promise<{ message: string }> {
    const deleted = await this.tokenService.deleteByUserId(userId);
    if (!deleted) throw new BadRequestException('No token to delete');
    return { message: 'Logged out successfully' };
  }
}