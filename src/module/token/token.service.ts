
import { SaveTokenDto } from './dto/save-token';
import { UsersService } from '../user/user.service';
import { Token } from './token.entity';
import { User } from '../user/user.entity';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>, 
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, 
  ) {}

  async create(user: User, saveTokenDto: SaveTokenDto): Promise<Token> {
    let token = await this.tokenRepository.findOne({ where: { user: { id: user.id } } });

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
    return await this.tokenRepository.findOne({
      where: {
        refeshtokenused: Like(`%${refreshToken}%`),
      },
    });
  }
  async findByRefreshToken(refreshToken: string): Promise<Token | null> {
    return await this.tokenRepository.findOne({
      where: { refreshToken },
    });
  }

  async findAccessToken(accessToken: string): Promise<Token | null> {
    return await this.tokenRepository.findOne({
      where: { accessToken },
    });
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found!');
  
    const deleteResult = await this.tokenRepository.delete({ user: { id: userId } });
    return (deleteResult.affected ?? 0) > 0; 
    }
}