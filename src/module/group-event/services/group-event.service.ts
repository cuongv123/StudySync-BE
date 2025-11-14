import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { GroupEvent } from '../entities/group-event.entity';
import { EventParticipant } from '../entities/event-participant.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { FilterEventDto } from '../dto/filter-event.dto';
import { StudyGroup } from '../../group/entities/group.entity';
import { User } from '../../User/entities/user.entity';
import { NotificationService } from '../../notification/notification.service';

@Injectable()
export class GroupEventService {
  constructor(
    @InjectRepository(GroupEvent)
    private readonly groupEventRepository: Repository<GroupEvent>,
    @InjectRepository(EventParticipant)
    private readonly eventParticipantRepository: Repository<EventParticipant>,
    @InjectRepository(StudyGroup)
    private readonly studyGroupRepository: Repository<StudyGroup>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Tạo sự kiện mới trong nhóm
   */
  async createEvent(
    createEventDto: CreateEventDto,
    userId: string,
  ): Promise<GroupEvent> {
    const { groupId, eventDate, endDate, participantIds, ...eventData } = createEventDto;

    // Kiểm tra nhóm có tồn tại không
    const group = await this.studyGroupRepository.findOne({
      where: { id: groupId },
      relations: ['members', 'members.user'],
    });

    if (!group) {
      throw new NotFoundException(`Không tìm thấy nhóm với ID: ${groupId}`);
    }

    // Kiểm tra user có phải là thành viên của nhóm không
    const isMember = group.members.some((member) => member.user.id === userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải là thành viên của nhóm này');
    }

    // Validate dates
    const startDate = new Date(eventDate);
    const eventEndDate = endDate ? new Date(endDate) : null;

    if (eventEndDate && eventEndDate < startDate) {
      throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    }

    // Validate không được tạo event trùng thời gian trong cùng nhóm
    const conflictingEvent = await this.groupEventRepository
      .createQueryBuilder('event')
      .where('event.groupId = :groupId', { groupId })
      .andWhere(
        '(event.eventDate, event.endDate) OVERLAPS (:startDate, :endDate)',
        { 
          startDate: startDate.toISOString(), 
          endDate: eventEndDate ? eventEndDate.toISOString() : startDate.toISOString() 
        }
      )
      .getOne();

    if (conflictingEvent) {
      throw new BadRequestException(
        `Nhóm đã có sự kiện "${conflictingEvent.title}" vào thời gian này. Vui lòng chọn thời gian khác.`
      );
    }

    // Validate participantIds nếu có
    const groupMemberIds = group.members.map((member) => member.user.id);
    if (participantIds && participantIds.length > 0) {
      const invalidIds = participantIds.filter((id) => !groupMemberIds.includes(id));
      
      if (invalidIds.length > 0) {
        throw new BadRequestException(
          `Một số participants không phải là thành viên của nhóm`,
        );
      }
    }

    // Tạo event
    const event = this.groupEventRepository.create({
      ...eventData,
      groupId,
      creatorId: userId,
      eventDate: startDate,
      endDate: eventEndDate,
    });

    const savedEvent = await this.groupEventRepository.save(event);

    // Tạo participants nếu có (note những người cần tham gia)
    if (participantIds && participantIds.length > 0) {
      const participants = participantIds.map((participantId) =>
        this.eventParticipantRepository.create({
          eventId: savedEvent.id,
          userId: participantId,
        }),
      );
      await this.eventParticipantRepository.save(participants);
    }

    // Gửi notification cho TẤT CẢ members trong group (trừ người tạo)
    const allMemberIds = groupMemberIds.filter((id) => id !== userId);
    
    if (allMemberIds.length > 0) {
      const participantCount = participantIds ? participantIds.length : 0;
      const participantText = participantCount > 0 
        ? ` - Cần ${participantCount} người tham gia` 
        : '';

      await this.notificationService.createBulkNotifications({
        userIds: allMemberIds,
        title: '🗓️ Sự kiện mới trong nhóm',
        message: `${event.title}${participantText} - ${this.formatEventDate(startDate, eventEndDate)}`,
        type: 'EVENT_CREATED',
        groupId: group.id,
      });
    }

    // Load lại event với participants để trả về đầy đủ thông tin
    return await this.groupEventRepository.findOne({
      where: { id: savedEvent.id },
      relations: ['participants', 'participants.user', 'group', 'creator'],
    });
  }

  /**
   * Lấy danh sách sự kiện theo filter
   */
  async getEvents(
    filterDto: FilterEventDto,
    userId: string,
  ): Promise<GroupEvent[]> {
    const { groupId, eventType, startDate, endDate } = filterDto;

    // Build query
    const queryBuilder = this.groupEventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.group', 'group')
      .leftJoinAndSelect('event.creator', 'creator')
      .leftJoinAndSelect('event.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'participantUser')
      .leftJoin('group.members', 'member')
      .leftJoin('member.user', 'user')
      .where('user.id = :userId', { userId });

    // Apply filters
    if (groupId) {
      queryBuilder.andWhere('event.groupId = :groupId', { groupId });
    }

    if (eventType) {
      queryBuilder.andWhere('event.eventType = :eventType', { eventType });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'event.eventDate BETWEEN :startDate AND :endDate',
        { startDate: new Date(startDate), endDate: new Date(endDate) },
      );
    } else if (startDate) {
      queryBuilder.andWhere('event.eventDate >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere('event.eventDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    queryBuilder.orderBy('event.eventDate', 'ASC');

    return await queryBuilder.getMany();
  }

  /**
   * Lấy chi tiết một sự kiện
   */
  async getEventById(eventId: string, userId: string): Promise<GroupEvent> {
    const event = await this.groupEventRepository.findOne({
      where: { id: eventId },
      relations: [
        'group',
        'group.members',
        'group.members.user',
        'creator',
        'participants',
        'participants.user',
      ],
    });

    if (!event) {
      throw new NotFoundException(`Không tìm thấy sự kiện với ID: ${eventId}`);
    }

    // Kiểm tra user có phải là thành viên của nhóm không
    const isMember = event.group.members.some(
      (member) => member.user.id === userId,
    );
    if (!isMember) {
      throw new ForbiddenException(
        'Bạn không có quyền xem sự kiện của nhóm này',
      );
    }

    return event;
  }

  /**
   * Cập nhật sự kiện
   */
  async updateEvent(
    eventId: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ): Promise<GroupEvent> {
    const { eventDate, endDate, participantIds, ...updateData } = updateEventDto;

    const event = await this.groupEventRepository.findOne({
      where: { id: eventId },
      relations: ['group', 'group.members', 'group.members.user', 'creator', 'participants'],
    });

    if (!event) {
      throw new NotFoundException(`Không tìm thấy sự kiện với ID: ${eventId}`);
    }

    // Chỉ creator hoặc group leader mới được cập nhật
    const isCreator = event.creatorId === userId;
    const isLeader = event.group.leaderId === userId;

    if (!isCreator && !isLeader) {
      throw new ForbiddenException(
        'Chỉ người tạo sự kiện hoặc chủ nhóm mới có thể chỉnh sửa',
      );
    }

    // Validate dates nếu có update
    if (eventDate || endDate) {
      const newStartDate = eventDate ? new Date(eventDate) : event.eventDate;
      const newEndDate = endDate ? new Date(endDate) : event.endDate;

      if (newEndDate && newEndDate < newStartDate) {
        throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
      }

      // Validate không được update thành thời gian trùng với event khác
      const conflictingEvent = await this.groupEventRepository
        .createQueryBuilder('event')
        .where('event.groupId = :groupId', { groupId: event.groupId })
        .andWhere('event.id != :currentEventId', { currentEventId: eventId })
        .andWhere(
          '(event.eventDate, event.endDate) OVERLAPS (:startDate, :endDate)',
          { 
            startDate: newStartDate.toISOString(), 
            endDate: newEndDate ? newEndDate.toISOString() : newStartDate.toISOString() 
          }
        )
        .getOne();

      if (conflictingEvent) {
        throw new BadRequestException(
          `Thời gian này trùng với sự kiện "${conflictingEvent.title}". Vui lòng chọn thời gian khác.`
        );
      }

      if (eventDate) event.eventDate = newStartDate;
      if (endDate) event.endDate = newEndDate;
    }

    // Update các fields khác
    Object.assign(event, updateData);

    // Update participants nếu có
    if (participantIds !== undefined) {
      // Lấy danh sách participants hiện tại
      const currentParticipants = await this.eventParticipantRepository.find({
        where: { eventId: event.id },
      });
      const currentUserIds = currentParticipants.map((p) => p.userId);

      // Tìm những người cần XÓA (có trong DB nhưng không có trong request)
      const toRemove = currentUserIds.filter((id) => !participantIds.includes(id));
      
      // Tìm những người cần THÊM (có trong request nhưng không có trong DB)
      const toAdd = participantIds.filter((id) => !currentUserIds.includes(id));

      // Xóa những người không còn
      if (toRemove.length > 0) {
        await this.eventParticipantRepository.delete({
          eventId: event.id,
          userId: In(toRemove),
        });
      }

      // Thêm những người mới
      if (toAdd.length > 0) {
        const newParticipants = toAdd.map((participantId) =>
          this.eventParticipantRepository.create({
            eventId: event.id,
            userId: participantId,
          }),
        );
        await this.eventParticipantRepository.save(newParticipants);
      }
    }

    const updatedEvent = await this.groupEventRepository.save(event);

    // Gửi notification cho TẤT CẢ members (trừ người cập nhật)
    const allMemberIds = event.group.members
      .map((member) => member.user.id)
      .filter((memberId) => memberId !== userId);

    if (allMemberIds.length > 0) {
      await this.notificationService.createBulkNotifications({
        userIds: allMemberIds,
        title: '✏️ Sự kiện đã cập nhật',
        message: `${updatedEvent.title} đã được chỉnh sửa`,
        type: 'EVENT_UPDATED',
        groupId: event.group.id,
      });
    }

    // Load lại với participants
    return await this.groupEventRepository.findOne({
      where: { id: updatedEvent.id },
      relations: ['participants', 'participants.user', 'group', 'creator'],
    });
  }

  /**
   * Xóa sự kiện
   */
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    const event = await this.groupEventRepository.findOne({
      where: { id: eventId },
      relations: ['group', 'group.members', 'group.members.user'],
    });

    if (!event) {
      throw new NotFoundException(`Không tìm thấy sự kiện với ID: ${eventId}`);
    }

    // Chỉ creator hoặc group leader mới được xóa
    const isCreator = event.creatorId === userId;
    const isLeader = event.group.leaderId === userId;

    if (!isCreator && !isLeader) {
      throw new ForbiddenException(
        'Chỉ người tạo sự kiện hoặc chủ nhóm mới có thể xóa',
      );
    }

    const eventTitle = event.title;

    await this.groupEventRepository.remove(event);

    // Gửi notification cho TẤT CẢ members (trừ người xóa)
    const allMemberIds = event.group.members
      .map((member) => member.user.id)
      .filter((memberId) => memberId !== userId);

    if (allMemberIds.length > 0) {
      await this.notificationService.createBulkNotifications({
        userIds: allMemberIds,
        title: '🗑️ Sự kiện đã xóa',
        message: `${eventTitle} đã bị xóa khỏi lịch`,
        type: 'EVENT_DELETED',
        groupId: event.group.id,
      });
    }
  }

  /**
   * Xóa tự động các events đã qua giờ kết thúc (gọi bởi cron job)
   */
  async deleteExpiredEvents(): Promise<number> {
    const now = new Date();
    
    // Tìm các events đã qua giờ kết thúc (hoặc qua eventDate nếu không có endDate)
    const expiredEvents = await this.groupEventRepository
      .createQueryBuilder('event')
      .where('event.endDate IS NOT NULL AND event.endDate < :now', { now })
      .orWhere('event.endDate IS NULL AND event.eventDate < :now', { now })
      .getMany();

    if (expiredEvents.length > 0) {
      await this.groupEventRepository.remove(expiredEvents);
    }

    return expiredEvents.length;
  }

  /**
   * Format event date for display
   */
  private formatEventDate(startDate: Date, endDate: Date | null): string {
    const start = startDate.toLocaleString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (!endDate) {
      return start;
    }

    const end = endDate.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${start} - ${end}`;
  }
}
