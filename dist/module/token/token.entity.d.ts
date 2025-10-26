import { User } from '../User/entities/User.entity';
export declare class Token {
    id: number;
    refeshtokenused: string[];
    accessToken: string;
    refreshToken: string;
    user: User;
}
