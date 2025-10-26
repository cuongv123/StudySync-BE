import { NotificationType } from '../entities/notification.entity';
export declare class GetNotificationsDto {
    page?: number;
    limit?: number;
    isRead?: boolean;
    types?: NotificationType[];
}
export declare class MarkAsReadDto {
    notificationIds: number[];
}
export declare class CreateNotificationDto {
    type: NotificationType;
    title: string;
    message: string;
    userId: string;
    groupId?: number;
    relatedUserId?: string;
}
