import { User } from '../../User/entities/User.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled"
}
export declare class UserSubscription {
    id: number;
    userId: string;
    planId: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    autoRenew: boolean;
    status: SubscriptionStatus;
    purchasedFromWallet: boolean;
    usagePersonalStorageMb: number;
    usageVideoMinutes: number;
    usageAiQueries: number;
    lastResetDate: Date;
    user: User;
    plan: SubscriptionPlan;
    createdAt: Date;
    updatedAt: Date;
    isExpired(): boolean;
    getDaysRemaining(): number | null;
    isExpiringSoon(days?: number): boolean;
    canUseAI(): boolean;
    canUseStorage(additionalMb: number): boolean;
    canUseVideo(additionalMinutes: number): boolean;
    getRemainingAiQueries(): number;
    getRemainingStorage(): number;
    getRemainingVideoMinutes(): number;
    incrementAiUsage(): void;
    incrementStorageUsage(mb: number): void;
    incrementVideoUsage(minutes: number): void;
    resetUsage(): void;
    expire(): void;
    activate(): void;
    cancel(): void;
}
