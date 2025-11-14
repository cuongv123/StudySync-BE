import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto, GetNotificationsDto } from './dto/notification.dto';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(createDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type: createDto.type,
      title: createDto.title,
      content: createDto.message,
      userId: createDto.userId,
      relatedId: createDto.groupId,
      relatedType: 'group',
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Emit real-time notification với separate events cho chat vs system
    if (savedNotification && this.notificationGateway) {
      try {
        const notificationData = {
          id: savedNotification.id,
          type: savedNotification.type,
          title: savedNotification.title,
          content: savedNotification.content,
          relatedId: savedNotification.relatedId,
          relatedType: savedNotification.relatedType,
          isRead: savedNotification.isRead,
          createdAt: savedNotification.createdAt,
        };

        // Phân biệt chat notifications vs system notifications
        const chatNotificationTypes = [NotificationType.NEW_MESSAGE, NotificationType.MESSAGE_REPLY];
        if (chatNotificationTypes.includes(savedNotification.type as NotificationType)) {
          await this.notificationGateway.emitChatNotification(savedNotification.userId, notificationData);
        } else {
          await this.notificationGateway.emitSystemNotification(savedNotification.userId, notificationData);
        }
      } catch (error) {
        console.error('Failed to emit real-time notification:', error);
        // Don't throw error as notification is already saved
      }
    }
    
    return savedNotification;
  }

  async getNotifications(
    userId: string, 
    query: GetNotificationsDto
  ): Promise<ApiResponse<{ notifications: Notification[]; total: number; hasMore: boolean }>> {
    try {
      const { page = 1, limit = 10, isRead, types } = query;
      const skip = (page - 1) * limit;

      const queryBuilder = this.notificationRepository
        .createQueryBuilder('notification')
        .where('notification.userId = :userId', { userId })
        .orderBy('notification.createdAt', 'DESC');

      // Filter by read status
      if (typeof isRead === 'boolean') {
        queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
      }

      // Filter by notification types
      if (types && types.length > 0) {
        queryBuilder.andWhere('notification.type IN (:...types)', { types });
      }

      const [notifications, total] = await queryBuilder
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      const hasMore = skip + notifications.length < total;

      return {
        statusCode: 200,
        message: 'Notifications retrieved successfully',
        data: { notifications, total, hasMore },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<ApiResponse<{ count: number }>> {
    try {
      const count = await this.notificationRepository.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return {
        statusCode: 200,
        message: 'Unread count retrieved successfully',
        data: { count },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }

  async markAsRead(
    userId: string, 
    notificationIds: number[]
  ): Promise<ApiResponse<{ updatedCount: number }>> {
    try {
      const result = await this.notificationRepository.update(
        {
          id: In(notificationIds),
          userId,
          isRead: false,
        },
        { isRead: true }
      );

      return {
        statusCode: 200,
        message: 'Notifications marked as read successfully',
        data: { updatedCount: result.affected || 0 },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<ApiResponse<{ updatedCount: number }>> {
    try {
      const result = await this.notificationRepository.update(
        {
          userId,
          isRead: false,
        },
        { isRead: true }
      );

      return {
        statusCode: 200,
        message: 'All notifications marked as read successfully',
        data: { updatedCount: result.affected || 0 },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteNotification(
    userId: string, 
    notificationId: number
  ): Promise<ApiResponse<null>> {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      await this.notificationRepository.remove(notification);

      return {
        statusCode: 200,
        message: 'Notification deleted successfully',
        data: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }

  // Helper methods for creating specific notification types
  
  /**
   * Tạo notifications hàng loạt cho nhiều users
   */
  async createBulkNotifications(params: {
    userIds: string[];
    title: string;
    message: string;
    type: string;
    groupId: number;
  }): Promise<void> {
    const { userIds, title, message, type, groupId } = params;

    const notifications = userIds.map((userId) =>
      this.notificationRepository.create({
        type: type as NotificationType,
        title,
        content: message,
        userId,
        relatedId: groupId,
        relatedType: 'group',
      }),
    );

    const savedNotifications = await this.notificationRepository.save(notifications);

    // Emit real-time notifications
    if (this.notificationGateway) {
      try {
        for (const notification of savedNotifications) {
          const notificationData = {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            content: notification.content,
            relatedId: notification.relatedId,
            relatedType: notification.relatedType,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
          };

          await this.notificationGateway.emitSystemNotification(
            notification.userId,
            notificationData,
          );
        }
      } catch (error) {
        console.error('Failed to emit bulk notifications:', error);
      }
    }
  }

  async createInviteNotification(
    invitedUserId: string,
    inviterName: string,
    groupName: string,
    groupId: number,
    inviterId: string
  ): Promise<Notification> {
    return await this.createNotification({
      type: NotificationType.INVITE_RECEIVED,
      title: 'Lời mời tham gia nhóm',
      message: `${inviterName} đã mời bạn tham gia nhóm "${groupName}"`,
      userId: invitedUserId,
      groupId,
      relatedUserId: inviterId,
    });
  }

  async createJoinRequestNotification(
    leaderId: string,
    requesterName: string,
    groupName: string,
    groupId: number,
    requesterId: string
  ): Promise<Notification> {
    return await this.createNotification({
      type: NotificationType.JOIN_REQUEST,
      title: 'Yêu cầu tham gia nhóm',
      message: `${requesterName} muốn tham gia nhóm "${groupName}"`,
      userId: leaderId,
      groupId,
      relatedUserId: requesterId,
    });
  }

  async createMemberJoinedNotification(
    memberIds: string[],
    newMemberName: string,
    groupName: string,
    groupId: number,
    newMemberId: string
  ): Promise<Notification[]> {
    const notifications = [];
    for (const memberId of memberIds) {
      if (memberId !== newMemberId) { // Don't notify the new member about themselves
        const notification = await this.createNotification({
          type: NotificationType.MEMBER_JOINED,
          title: 'Thành viên mới',
          message: `${newMemberName} đã tham gia nhóm "${groupName}"`,
          userId: memberId,
          groupId,
          relatedUserId: newMemberId,
        });
        notifications.push(notification);
      }
    }
    return notifications;
  }

  async createMemberLeftNotification(
    memberIds: string[],
    leftMemberName: string,
    groupName: string,
    groupId: number,
    leftMemberId: string
  ): Promise<Notification[]> {
    const notifications = [];
    for (const memberId of memberIds) {
      if (memberId !== leftMemberId) { // Don't notify the left member
        const notification = await this.createNotification({
          type: NotificationType.MEMBER_LEFT,
          title: 'Thành viên rời nhóm',
          message: `${leftMemberName} đã rời khỏi nhóm "${groupName}"`,
          userId: memberId,
          groupId,
          relatedUserId: leftMemberId,
        });
        notifications.push(notification);
      }
    }
    return notifications;
  }

  // Facebook-style separate notification methods
  async getChatNotifications(userId: string, query: GetNotificationsDto): Promise<ApiResponse<any>> {
    const { page = 1, limit = 10, isRead } = query;
    const skip = (page - 1) * limit;

    const chatTypes = [NotificationType.NEW_MESSAGE, NotificationType.MESSAGE_REPLY];
    
    const whereCondition: any = {
      userId,
      type: In(chatTypes),
    };

    if (typeof isRead === 'boolean') {
      whereCondition.isRead = isRead;
    }

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      statusCode: 200,
      message: 'Lấy danh sách chat notifications thành công',
      timestamp: new Date().toISOString(),
    };
  }

  async getSystemNotifications(userId: string, query: GetNotificationsDto): Promise<ApiResponse<any>> {
    const { page = 1, limit = 10, isRead } = query;
    const skip = (page - 1) * limit;

    const chatTypes = [NotificationType.NEW_MESSAGE, NotificationType.MESSAGE_REPLY];
    
    const whereCondition: any = {
      userId,
      type: In(Object.values(NotificationType).filter(type => !chatTypes.includes(type as NotificationType))),
    };

    if (typeof isRead === 'boolean') {
      whereCondition.isRead = isRead;
    }

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      statusCode: 200,
      message: 'Lấy danh sách system notifications thành công',
      timestamp: new Date().toISOString(),
    };
  }

  async getChatUnreadCount(userId: string): Promise<{ count: number }> {
    const chatTypes = [NotificationType.NEW_MESSAGE, NotificationType.MESSAGE_REPLY];
    
    const count = await this.notificationRepository.count({
      where: {
        userId,
        isRead: false,
        type: In(chatTypes),
      },
    });

    return { count };
  }

  async getSystemUnreadCount(userId: string): Promise<{ count: number }> {
    const chatTypes = [NotificationType.NEW_MESSAGE, NotificationType.MESSAGE_REPLY];
    
    const count = await this.notificationRepository.count({
      where: {
        userId,
        isRead: false,
        type: In(Object.values(NotificationType).filter(type => !chatTypes.includes(type as NotificationType))),
      },
    });

    return { count };
  }
}