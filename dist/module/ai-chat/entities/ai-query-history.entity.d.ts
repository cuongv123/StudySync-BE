import { User } from '../../User/entities/User.entity';
export declare class AiQueryHistory {
    id: number;
    userId: string;
    queryText: string;
    responseText: string;
    createdAt: Date;
    user: User;
}
