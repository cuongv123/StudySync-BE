import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto, GetNotificationsDto } from './dto/notification.dto';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { NotificationGateway } from './notification.gateway';
export declare class NotificationService {
    private readonly notificationRepository;
    private readonly notificationGateway;
    constructor(notificationRepository: Repository<Notification>, notificationGateway: NotificationGateway);
    createNotification(createDto: CreateNotificationDto): Promise<Notification>;
    getNotifications(userId: string, query: GetNotificationsDto): Promise<ApiResponse<{
        notifications: Notification[];
        total: number;
        hasMore: boolean;
    }>>;
    getUnreadCount(userId: string): Promise<ApiResponse<{
        count: number;
    }>>;
    markAsRead(userId: string, notificationIds: number[]): Promise<ApiResponse<{
        updatedCount: number;
    }>>;
    markAllAsRead(userId: string): Promise<ApiResponse<{
        updatedCount: number;
    }>>;
    deleteNotification(userId: string, notificationId: number): Promise<ApiResponse<null>>;
    createInviteNotification(invitedUserId: string, inviterName: string, groupName: string, groupId: number, inviterId: string): Promise<Notification>;
    createJoinRequestNotification(leaderId: string, requesterName: string, groupName: string, groupId: number, requesterId: string): Promise<Notification>;
    createMemberJoinedNotification(memberIds: string[], newMemberName: string, groupName: string, groupId: number, newMemberId: string): Promise<Notification[]>;
    createMemberLeftNotification(memberIds: string[], leftMemberName: string, groupName: string, groupId: number, leftMemberId: string): Promise<Notification[]>;
    getChatNotifications(userId: string, query: GetNotificationsDto): Promise<ApiResponse<any>>;
    getSystemNotifications(userId: string, query: GetNotificationsDto): Promise<ApiResponse<any>>;
    getChatUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    getSystemUnreadCount(userId: string): Promise<{
        count: number;
    }>;
}
