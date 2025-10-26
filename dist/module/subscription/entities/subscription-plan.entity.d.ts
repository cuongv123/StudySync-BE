export declare class SubscriptionPlan {
    id: number;
    planName: string;
    price: number;
    personalStorageLimitMb: number;
    videoCallMinutesLimit: number;
    aiQueriesLimit: number;
    durationDays: number;
    description: string;
    isActive: boolean;
    userSubscriptions: any[];
    createdAt: Date;
    isFree(): boolean;
    isPro(): boolean;
    isProMax(): boolean;
    isUnlimited(): boolean;
    getFormattedPrice(): string;
    getDurationText(): string;
    getFeatureSummary(): string;
}
