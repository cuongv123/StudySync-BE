import { NotificationService } from './notification.service';
import { GetNotificationsDto, MarkAsReadDto } from './dto/notification.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getNotifications(req: any, query: GetNotificationsDto): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<{
        notifications: import("./entities/notification.entity").Notification[];
        total: number;
        hasMore: boolean;
    }>>;
    getUnreadCount(req: any): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<{
        count: number;
    }>>;
    markAsRead(req: any, markAsReadDto: MarkAsReadDto): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<{
        updatedCount: number;
    }>>;
    markAllAsRead(req: any): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<{
        updatedCount: number;
    }>>;
    getChatNotifications(req: any, query: GetNotificationsDto): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<any>>;
    getSystemNotifications(req: any, query: GetNotificationsDto): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<any>>;
    getChatUnreadCount(req: any): Promise<{
        count: number;
    }>;
    getSystemUnreadCount(req: any): Promise<{
        count: number;
    }>;
    deleteNotification(req: any, notificationId: number): Promise<import("../../common/interfaces/api-response.interface").ApiResponse<null>>;
}
