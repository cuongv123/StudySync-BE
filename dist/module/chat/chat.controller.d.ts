import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    sendMessage(req: any, groupId: number, createMessageDto: CreateMessageDto): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/message.entity").Message;
    }>;
    getMessages(req: any, groupId: number, getMessagesDto: GetMessagesDto): Promise<{
        success: boolean;
        message: string;
        data: {
            messages: import("./entities/message.entity").Message[];
            total: number;
            page: number;
            limit: number;
            hasMore: boolean;
        };
    }>;
    getMessageById(req: any, groupId: number, messageId: number): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/message.entity").Message;
    }>;
    updateMessage(req: any, groupId: number, messageId: number, updateMessageDto: UpdateMessageDto): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/message.entity").Message;
    }>;
    deleteMessage(req: any, groupId: number, messageId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getUnreadCount(req: any, groupId: number): Promise<{
        success: boolean;
        message: string;
        data: {
            count: number;
        };
    }>;
}
