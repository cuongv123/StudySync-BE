import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../User/User.service';
import { TokenService } from '../token/token.service';
import { Role } from 'src/common/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private jwtService: JwtService,
  ) {}

  private genJti() {
    return randomBytes(16).toString('hex');
  }

  async register(registerDto: RegisterDto) {
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

    return { message: 'Register success', userId: newUser.id, email: newUser.email, role: newUser.role };
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

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

    await this.tokenService.create(user, {
      accessToken,
      refreshToken,
      refeshtokenused: [],
    });

    return { access_token: accessToken, refresh_token: refreshToken };
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
      throw new UnauthorizedException('Refresh token already used');
    }

    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    const newTokens = await this.generateAndSaveTokens(user);

    await this.tokenService.addUsedRefreshToken(userId, refreshToken);

    return newTokens;
  }

  async logout(userId: string, accessToken: any) {
    try {
      await this.tokenService.deleteByUserId(userId);
      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      throw new InternalServerErrorException('Failed to logout');
    }
  }
}
