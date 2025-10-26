import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../User/User.service';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    user?: any;
}
export declare class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private userService;
    server: Server;
    private readonly logger;
    private connectedUsers;
    constructor(jwtService: JwtService, userService: UsersService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): void;
    handleJoinGroupNotifications(client: AuthenticatedSocket, data: {
        groupId: string;
    }): Promise<void>;
    handleLeaveGroupNotifications(client: AuthenticatedSocket, data: {
        groupId: string;
    }): Promise<void>;
    emitToUser(userId: string, event: string, data: any): Promise<void>;
    emitToGroup(groupId: string, event: string, data: any): Promise<void>;
    emitToMultipleUsers(userIds: string[], event: string, data: any): Promise<void>;
    emitChatNotification(userId: string, data: any): Promise<void>;
    emitSystemNotification(userId: string, data: any): Promise<void>;
    isUserConnected(userId: string): boolean;
    getConnectedUsers(): string[];
}
export {};
