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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./entities/message.entity");
const group_entity_1 = require("../group/entities/group.entity");
const group_member_entity_1 = require("../group/entities/group-member.entity");
const notification_service_1 = require("../notification/notification.service");
const notification_entity_1 = require("../notification/entities/notification.entity");
const User_entity_1 = require("../User/entities/User.entity");
let ChatService = class ChatService {
    constructor(messageRepository, groupRepository, groupMemberRepository, userRepository, notificationService) {
        this.messageRepository = messageRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }
    async isGroupMember(userId, groupId) {
        const member = await this.groupMemberRepository.findOne({
            where: { userId, groupId },
        });
        return !!member;
    }
    async sendMessage(userId, groupId, createMessageDto) {
        const group = await this.groupRepository.findOne({
            where: { id: groupId },
        });
        if (!group) {
            throw new common_1.NotFoundException('Nhóm không tồn tại');
        }
        const isMember = await this.isGroupMember(userId, groupId);
        if (!isMember) {
            throw new common_1.ForbiddenException('Bạn không phải thành viên của nhóm này');
        }
        if (createMessageDto.replyToId) {
            const replyMessage = await this.messageRepository.findOne({
                where: { id: createMessageDto.replyToId, groupId },
            });
            if (!replyMessage) {
                throw new common_1.BadRequestException('Tin nhắn được reply không tồn tại');
            }
        }
        const message = this.messageRepository.create(Object.assign(Object.assign({}, createMessageDto), { groupId, senderId: userId }));
        const savedMessage = await this.messageRepository.save(message);
        await this.sendChatNotifications(userId, groupId, savedMessage, createMessageDto.replyToId);
        return savedMessage;
    }
    async getMessages(userId, groupId, getMessagesDto) {
        const isMember = await this.isGroupMember(userId, groupId);
        if (!isMember) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem tin nhắn của nhóm này');
        }
        const { page = 1, limit = 50, beforeMessageId } = getMessagesDto;
        const skip = (page - 1) * limit;
        const queryBuilder = this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.replyTo', 'replyTo')
            .leftJoinAndSelect('replyTo.sender', 'replyToSender')
            .where('message.groupId = :groupId', { groupId })
            .andWhere('message.isDeleted = :isDeleted', { isDeleted: false });
        if (beforeMessageId) {
            queryBuilder.andWhere('message.id < :beforeMessageId', { beforeMessageId });
        }
        queryBuilder
            .orderBy('message.createdAt', 'DESC')
            .skip(skip)
            .take(limit);
        const [messages, total] = await queryBuilder.getManyAndCount();
        messages.reverse();
        return {
            messages,
            total,
            page,
            limit,
            hasMore: skip + messages.length < total,
        };
    }
    async updateMessage(userId, groupId, messageId, updateMessageDto) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId, groupId },
            relations: ['sender'],
        });
        if (!message) {
            throw new common_1.NotFoundException('Tin nhắn không tồn tại');
        }
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('Bạn chỉ có thể sửa tin nhắn của mình');
        }
        if (message.isDeleted) {
            throw new common_1.BadRequestException('Không thể sửa tin nhắn đã xóa');
        }
        message.content = updateMessageDto.content;
        message.isEdited = true;
        return await this.messageRepository.save(message);
    }
    async deleteMessage(userId, groupId, messageId) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId, groupId },
        });
        if (!message) {
            throw new common_1.NotFoundException('Tin nhắn không tồn tại');
        }
        const isMember = await this.groupMemberRepository.findOne({
            where: { userId, groupId },
        });
        const group = await this.groupRepository.findOne({
            where: { id: groupId },
        });
        const isOwner = message.senderId === userId;
        const isLeader = (group === null || group === void 0 ? void 0 : group.leaderId) === userId;
        if (!isOwner && !isLeader) {
            throw new common_1.ForbiddenException('Bạn không có quyền xóa tin nhắn này');
        }
        message.isDeleted = true;
        message.deletedAt = new Date();
        message.content = 'Tin nhắn đã bị xóa';
        await this.messageRepository.save(message);
    }
    async getMessageById(userId, groupId, messageId) {
        const isMember = await this.isGroupMember(userId, groupId);
        if (!isMember) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem tin nhắn của nhóm này');
        }
        const message = await this.messageRepository.findOne({
            where: { id: messageId, groupId },
            relations: ['sender', 'replyTo', 'replyTo.sender'],
        });
        if (!message) {
            throw new common_1.NotFoundException('Tin nhắn không tồn tại');
        }
        return message;
    }
    async getUnreadCount(userId, groupId) {
        const isMember = await this.isGroupMember(userId, groupId);
        if (!isMember) {
            throw new common_1.ForbiddenException('Bạn không phải thành viên của nhóm này');
        }
        return 0;
    }
    async sendChatNotifications(senderId, groupId, message, replyToId) {
        try {
            const [group, sender, groupMembers] = await Promise.all([
                this.groupRepository.findOne({ where: { id: groupId } }),
                this.userRepository.findOne({ where: { id: senderId } }),
                this.groupMemberRepository
                    .createQueryBuilder('member')
                    .select('member.userId')
                    .where('member.groupId = :groupId', { groupId })
                    .andWhere('member.userId != :senderId', { senderId })
                    .getMany()
            ]);
            if (!group || !sender || groupMembers.length === 0)
                return;
            const recipientUserIds = groupMembers.map(m => m.userId);
            const notificationType = replyToId ? notification_entity_1.NotificationType.MESSAGE_REPLY : notification_entity_1.NotificationType.NEW_MESSAGE;
            const title = replyToId ? 'Tin nhắn trả lời mới' : 'Tin nhắn mới';
            const content = replyToId
                ? `${sender.username} đã trả lời tin nhắn trong nhóm "${group.groupName}": ${message.content.substring(0, 50)}...`
                : `${sender.username} đã gửi tin nhắn trong nhóm "${group.groupName}": ${message.content.substring(0, 50)}...`;
            await this.notificationService.createBulkNotifications({
                userIds: recipientUserIds,
                type: notificationType,
                title,
                message: content,
                groupId
            });
        }
        catch (error) {
            console.error('Error sending chat notifications:', error);
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(group_entity_1.StudyGroup)),
    __param(2, (0, typeorm_1.InjectRepository)(group_member_entity_1.GroupMember)),
    __param(3, (0, typeorm_1.InjectRepository)(User_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], ChatService);
//# sourceMappingURL=chat.service.js.map