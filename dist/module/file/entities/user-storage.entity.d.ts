import { User } from '../../User/entities/User.entity';
export declare class UserStorage {
    id: number;
    userId: string;
    user: User;
    usedSpace: number;
    maxSpace: number;
    updatedAt: Date;
    get availableSpace(): number;
    get usedPercentage(): number;
}
