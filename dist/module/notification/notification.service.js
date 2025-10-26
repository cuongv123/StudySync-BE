"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const notification_gateway_1 = require("./notification.gateway");
let NotificationService = class NotificationService {
    constructor(notificationRepository, notificationGateway) {
        this.notificationRepository = notificationRepository;
        this.notificationGateway = notificationGateway;
    }
    async createNotification(createDto) {
        const notification = this.notificationRepository.create({
            type: createDto.type,
            title: createDto.title,
            content: createDto.message,
            userId: createDto.userId,
            relatedId: createDto.groupId,
            relatedType: 'group',
        });
        const savedNotification = await this.notificationRepository.save(notification);
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
                const chatNotificationTypes = [notification_entity_1.NotificationType.NEW_MESSAGE, notification_entity_1.NotificationType.MESSAGE_REPLY];
                if (chatNotificationTypes.includes(savedNotification.type)) {
                    await this.notificationGateway.emitChatNotification(savedNotification.userId, notificationData);
                }
                else {
                    await this.notificationGateway.emitSystemNotification(savedNotification.userId, notificationData);
                }
            }
            catch (error) {
                console.error('Failed to emit real-time notification:', error);
            }
        }
        return savedNotification;
    }
    async getNotifications(userId, query) {
        try {
            const { page = 1, limit = 10, isRead, types } = query;
            const skip = (page - 1) * limit;
            const queryBuilder = this.notificationRepository
                .createQueryBuilder('notification')
                .where('notification.userId = :userId', { userId })
                .orderBy('notification.createdAt', 'DESC');
            if (typeof isRead === 'boolean') {
                queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
            }
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
        }
        catch (error) {
            throw error;
        }
    }
    async getUnreadCount(userId) {
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
        }
        catch (error) {
            throw error;
        }
    }
    async markAsRead(userId, notificationIds) {
        try {
            const result = await this.notificationRepository.update({
                id: (0, typeorm_2.In)(notificationIds),
                userId,
                isRead: false,
            }, { isRead: true });
            return {
                statusCode: 200,
                message: 'Notifications marked as read successfully',
                data: { updatedCount: result.affected || 0 },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw error;
        }
    }
    async markAllAsRead(userId) {
        try {
            const result = await this.notificationRepository.update({
                userId,
                isRead: false,
            }, { isRead: true });
            return {
                statusCode: 200,
                message: 'All notifications marked as read successfully',
                data: { updatedCount: result.affected || 0 },
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw error;
        }
    }
    async deleteNotification(userId, notificationId) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId, userId },
            });
            if (!notification) {
                throw new common_1.NotFoundException('Notification not found');
            }
            await this.notificationRepository.remove(notification);
            return {
                statusCode: 200,
                message: 'Notification deleted successfully',
                data: null,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw error;
        }
    }
    async createInviteNotification(invitedUserId, inviterName, groupName, groupId, inviterId) {
        return await this.createNotification({
            type: notification_entity_1.NotificationType.INVITE_RECEIVED,
            title: 'Lời mời tham gia nhóm',
            message: `${inviterName} đã mời bạn tham gia nhóm "${groupName}"`,
            userId: invitedUserId,
            groupId,
            relatedUserId: inviterId,
        });
    }
    async createJoinRequestNotification(leaderId, requesterName, groupName, groupId, requesterId) {
        return await this.createNotification({
            type: notification_entity_1.NotificationType.JOIN_REQUEST,
            title: 'Yêu cầu tham gia nhóm',
            message: `${requesterName} muốn tham gia nhóm "${groupName}"`,
            userId: leaderId,
            groupId,
            relatedUserId: requesterId,
        });
    }
    async createMemberJoinedNotification(memberIds, newMemberName, groupName, groupId, newMemberId) {
        const notifications = [];
        for (const memberId of memberIds) {
            if (memberId !== newMemberId) {
                const notification = await this.createNotification({
                    type: notification_entity_1.NotificationType.MEMBER_JOINED,
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
    async createMemberLeftNotification(memberIds, leftMemberName, groupName, groupId, leftMemberId) {
        const notifications = [];
        for (const memberId of memberIds) {
            if (memberId !== leftMemberId) {
                const notification = await this.createNotification({
                    type: notification_entity_1.NotificationType.MEMBER_LEFT,
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
    async getChatNotifications(userId, query) {
        const { page = 1, limit = 10, isRead } = query;
        const skip = (page - 1) * limit;
        const chatTypes = [notification_entity_1.NotificationType.NEW_MESSAGE, notification_entity_1.NotificationType.MESSAGE_REPLY];
        const whereCondition = {
            userId,
            type: (0, typeorm_2.In)(chatTypes),
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
    async getSystemNotifications(userId, query) {
        const { page = 1, limit = 10, isRead } = query;
        const skip = (page - 1) * limit;
        const chatTypes = [notification_entity_1.NotificationType.NEW_MESSAGE, notification_entity_1.NotificationType.MESSAGE_REPLY];
        const whereCondition = {
            userId,
            type: (0, typeorm_2.In)(Object.values(notification_entity_1.NotificationType).filter(type => !chatTypes.includes(type))),
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
    async getChatUnreadCount(userId) {
        const chatTypes = [notification_entity_1.NotificationType.NEW_MESSAGE, notification_entity_1.NotificationType.MESSAGE_REPLY];
        const count = await this.notificationRepository.count({
            where: {
                userId,
                isRead: false,
                type: (0, typeorm_2.In)(chatTypes),
            },
        });
        return { count };
    }
    async getSystemUnreadCount(userId) {
        const chatTypes = [notification_entity_1.NotificationType.NEW_MESSAGE, notification_entity_1.NotificationType.MESSAGE_REPLY];
        const count = await this.notificationRepository.count({
            where: {
                userId,
                isRead: false,
                type: (0, typeorm_2.In)(Object.values(notification_entity_1.NotificationType).filter(type => !chatTypes.includes(type))),
            },
        });
        return { count };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => notification_gateway_1.NotificationGateway))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notification_gateway_1.NotificationGateway])
], NotificationService);
//# sourceMappingURL=notification.service.js.map