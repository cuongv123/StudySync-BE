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

    // Emit real-time notification
    if (savedNotification && this.notificationGateway) {
      try {
        await this.notificationGateway.emitToUser(
          savedNotification.userId,
          'new_notification',
          {
            id: savedNotification.id,
            type: savedNotification.type,
            title: savedNotification.title,
            content: savedNotification.content,
            relatedId: savedNotification.relatedId,
            relatedType: savedNotification.relatedType,
            isRead: savedNotification.isRead,
            createdAt: savedNotification.createdAt,
          }
        );
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
}