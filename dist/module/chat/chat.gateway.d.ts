import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinRoom(client: Socket, data: {
        groupId: number;
    }): Promise<{
        success: boolean;
        message: string;
        groupId?: undefined;
    } | {
        success: boolean;
        message: string;
        groupId: number;
    }>;
    handleLeaveRoom(client: Socket, data: {
        groupId: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    handleSendMessage(client: Socket, data: {
        groupId: number;
        message: CreateMessageDto;
    }): Promise<{
        success: boolean;
        message: string;
    } | {
        success: boolean;
        message: import("./entities/message.entity").Message;
    }>;
    handleUpdateMessage(client: Socket, data: {
        groupId: number;
        messageId: number;
        content: UpdateMessageDto;
    }): Promise<{
        success: boolean;
        message: import("./entities/message.entity").Message;
    } | {
        success: boolean;
        message: string;
    }>;
    handleDeleteMessage(client: Socket, data: {
        groupId: number;
        messageId: number;
    }): Promise<{
        success: boolean;
        messageId: number;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        messageId?: undefined;
    }>;
    handleTyping(client: Socket, data: {
        groupId: number;
        isTyping: boolean;
    }): Promise<{
        success: boolean;
    }>;
    handleGetOnlineUsers(client: Socket, data: {
        groupId: number;
    }): Promise<{
        success: boolean;
        onlineUsers: string[];
        count: number;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        onlineUsers?: undefined;
        count?: undefined;
    }>;
}
