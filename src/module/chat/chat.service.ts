import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { StudyGroup } from '../group/entities/group.entity';
import { GroupMember } from '../group/entities/group-member.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(StudyGroup)
    private groupRepository: Repository<StudyGroup>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
  ) {}

  // Helper: Kiểm tra user có phải thành viên nhóm không
  private async isGroupMember(userId: string, groupId: number): Promise<boolean> {
    const member = await this.groupMemberRepository.findOne({
      where: { userId, groupId },
    });
    return !!member;
  }

  // Gửi tin nhắn
  async sendMessage(
    userId: string,
    groupId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    // Kiểm tra nhóm tồn tại
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Nhóm không tồn tại');
    }

    // Kiểm tra user có phải thành viên nhóm
    const isMember = await this.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải thành viên của nhóm này');
    }

    // Nếu có replyToId, kiểm tra tin nhắn được reply có tồn tại
    if (createMessageDto.replyToId) {
      const replyMessage = await this.messageRepository.findOne({
        where: { id: createMessageDto.replyToId, groupId },
      });

      if (!replyMessage) {
        throw new BadRequestException('Tin nhắn được reply không tồn tại');
      }
    }

    // Tạo tin nhắn mới
    const message = this.messageRepository.create({
      ...createMessageDto,
      groupId,
      senderId: userId,
    });

    return await this.messageRepository.save(message);
  }

  // Lấy lịch sử tin nhắn với pagination
  async getMessages(
    userId: string,
    groupId: number,
    getMessagesDto: GetMessagesDto,
  ): Promise<{
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    // Kiểm tra user có phải thành viên nhóm
    const isMember = await this.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không có quyền xem tin nhắn của nhóm này');
    }

    const { page = 1, limit = 50, beforeMessageId } = getMessagesDto;
    const skip = (page - 1) * limit;

    // Build query
    const queryBuilder = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.replyTo', 'replyTo')
      .leftJoinAndSelect('replyTo.sender', 'replyToSender')
      .where('message.groupId = :groupId', { groupId })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false });

    // Nếu có beforeMessageId, chỉ lấy tin nhắn trước đó (để load more)
    if (beforeMessageId) {
      queryBuilder.andWhere('message.id < :beforeMessageId', { beforeMessageId });
    }

    // Lấy tin nhắn mới nhất trước
    queryBuilder
      .orderBy('message.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    // Reverse để hiển thị tin nhắn cũ nhất ở trên
    messages.reverse();

    return {
      messages,
      total,
      page,
      limit,
      hasMore: skip + messages.length < total,
    };
  }

  // Sửa tin nhắn
  async updateMessage(
    userId: string,
    groupId: number,
    messageId: number,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, groupId },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Tin nhắn không tồn tại');
    }

    // Chỉ người gửi mới được sửa
    if (message.senderId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể sửa tin nhắn của mình');
    }

    // Không cho sửa tin nhắn đã xóa
    if (message.isDeleted) {
      throw new BadRequestException('Không thể sửa tin nhắn đã xóa');
    }

    message.content = updateMessageDto.content;
    message.isEdited = true;

    return await this.messageRepository.save(message);
  }

  // Xóa tin nhắn (soft delete)
  async deleteMessage(
    userId: string,
    groupId: number,
    messageId: number,
  ): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, groupId },
    });

    if (!message) {
      throw new NotFoundException('Tin nhắn không tồn tại');
    }

    // Kiểm tra quyền: chỉ người gửi hoặc nhóm trưởng được xóa
    const isMember = await this.groupMemberRepository.findOne({
      where: { userId, groupId },
    });

    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    const isOwner = message.senderId === userId;
    const isLeader = group?.leaderId === userId;

    if (!isOwner && !isLeader) {
      throw new ForbiddenException('Bạn không có quyền xóa tin nhắn này');
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'Tin nhắn đã bị xóa';

    await this.messageRepository.save(message);
  }

  // Lấy một tin nhắn cụ thể
  async getMessageById(
    userId: string,
    groupId: number,
    messageId: number,
  ): Promise<Message> {
    // Kiểm tra user có phải thành viên nhóm
    const isMember = await this.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không có quyền xem tin nhắn của nhóm này');
    }

    const message = await this.messageRepository.findOne({
      where: { id: messageId, groupId },
      relations: ['sender', 'replyTo', 'replyTo.sender'],
    });

    if (!message) {
      throw new NotFoundException('Tin nhắn không tồn tại');
    }

    return message;
  }

  // Đếm số tin nhắn chưa đọc (có thể mở rộng sau)
  async getUnreadCount(userId: string, groupId: number): Promise<number> {
    const isMember = await this.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải thành viên của nhóm này');
    }

    // TODO: Implement read receipts tracking
    // Hiện tại return 0, có thể mở rộng sau với bảng message_reads
    return 0;
  }
}
