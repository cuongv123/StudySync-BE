import { Repository } from 'typeorm';
import { Token } from './token.entity';
import { User } from '../User/entities/User.entity';
import { SaveTokenDto } from './dto/save-token';
export declare class TokenService {
    private readonly tokenRepository;
    private readonly userRepository;
    constructor(tokenRepository: Repository<Token>, userRepository: Repository<User>);
    create(user: User, saveTokenDto: SaveTokenDto): Promise<Token>;
    update(token: Token): Promise<Token>;
    findByRefreshTokenUsed(refreshToken: string): Promise<Token | null>;
    findByRefreshToken(refreshToken: string): Promise<Token | null>;
    findAccessToken(accessToken: string): Promise<Token | null>;
    addUsedRefreshToken(userId: string, usedRefreshToken: string): Promise<Token>;
    findByUserId(userId: string): Promise<Token | null>;
    deleteByUserId(userId: string): Promise<boolean>;
}
