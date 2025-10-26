import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { StudyGroup } from '../group/entities/group.entity';
import { GroupMember } from '../group/entities/group-member.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { NotificationService } from '../notification/notification.service';
import { User } from '../User/entities/User.entity';
export declare class ChatService {
    private messageRepository;
    private groupRepository;
    private groupMemberRepository;
    private userRepository;
    private notificationService;
    constructor(messageRepository: Repository<Message>, groupRepository: Repository<StudyGroup>, groupMemberRepository: Repository<GroupMember>, userRepository: Repository<User>, notificationService: NotificationService);
    private isGroupMember;
    sendMessage(userId: string, groupId: number, createMessageDto: CreateMessageDto): Promise<Message>;
    getMessages(userId: string, groupId: number, getMessagesDto: GetMessagesDto): Promise<{
        messages: Message[];
        total: number;
        page: number;
        limit: number;
        hasMore: boolean;
    }>;
    updateMessage(userId: string, groupId: number, messageId: number, updateMessageDto: UpdateMessageDto): Promise<Message>;
    deleteMessage(userId: string, groupId: number, messageId: number): Promise<void>;
    getMessageById(userId: string, groupId: number, messageId: number): Promise<Message>;
    getUnreadCount(userId: string, groupId: number): Promise<number>;
    private sendChatNotifications;
}
