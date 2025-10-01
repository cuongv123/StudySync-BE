import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './token.entity';
import { User } from '../User/User.entity';
import { SaveTokenDto } from './dto/save-token';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(user: User, saveTokenDto: SaveTokenDto): Promise<Token> {
    let token = await this.tokenRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'], // Load relation nếu cần
    });

    if (token) {
      token = {
        ...token,
        ...saveTokenDto,
      };
    } else {
      token = this.tokenRepository.create({
        ...saveTokenDto,
        user,
      });
    }

    return await this.tokenRepository.save(token);
  }

  async update(token: Token): Promise<Token> {
    return await this.tokenRepository.save(token);
  }

  async findByRefreshTokenUsed(refreshToken: string): Promise<Token | null> {
    return await this.tokenRepository
      .createQueryBuilder('token')
      .where(':refreshToken = ANY(token.refeshtokenused)', { refreshToken }) 
      .getOne();
  }

  async findByRefreshToken(refreshToken: string): Promise<Token | null> {
    return await this.tokenRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });
  }

  async findAccessToken(accessToken: string): Promise<Token | null> {
    return await this.tokenRepository.findOne({
      where: { accessToken },
      relations: ['user'],
    });
  }

  async addUsedRefreshToken(userId: string, usedRefreshToken: string): Promise<Token> {
    const token = await this.tokenRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!token) throw new BadRequestException('Token not found');
    token.refeshtokenused = [...(token.refeshtokenused || []), usedRefreshToken];
    return await this.tokenRepository.save(token);
  }
   async findByUserId(userId: string): Promise<Token | null> {
    return await this.tokenRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const deleteResult = await this.tokenRepository.delete({ user: { id: userId } });
    return (deleteResult.affected ?? 0) > 0;
  }
}