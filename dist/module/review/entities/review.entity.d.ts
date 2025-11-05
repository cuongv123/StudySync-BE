import { User } from '../../User/entities/User.entity';
export declare class Review {
    id: string;
    userId: string;
    rating: number;
    comment: string;
    adminReply: string;
    repliedBy: string;
    repliedAt: Date;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    admin: User;
}
