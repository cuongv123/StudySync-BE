import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../User/User.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract JWT token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findOne(payload.id);

      if (!user) {
        this.logger.warn(`Invalid user for token: ${payload.id}`);
        client.disconnect();
        return;
      }

      // Store user info in socket
      client.userId = user.id;
      client.user = user;

      // Store connection
      this.connectedUsers.set(user.id, client.id);

      // Join user to their personal notification room
      await client.join(`user_${user.id}`);

      this.logger.log(`User ${user.username} (${user.id}) connected: ${client.id}`);
      
      // Emit connection success
      client.emit('connection_success', {
        message: 'Connected to notification service',
        userId: user.id,
      });

    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error instanceof Error ? error.message : String(error));
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`User ${client.userId} disconnected: ${client.id}`);
    } else {
      this.logger.log(`Unauthenticated client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('join_group_notifications')
  async handleJoinGroupNotifications(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { groupId: string }
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      // TODO: Verify user is member of the group
      await client.join(`group_${data.groupId}`);
      
      this.logger.log(`User ${client.userId} joined group notifications: ${data.groupId}`);
      client.emit('joined_group_notifications', { groupId: data.groupId });
      
    } catch (error) {
      this.logger.error(`Error joining group notifications:`, error instanceof Error ? error.message : String(error));
      client.emit('error', { message: 'Failed to join group notifications' });
    }
  }

  @SubscribeMessage('leave_group_notifications')
  async handleLeaveGroupNotifications(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { groupId: string }
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      await client.leave(`group_${data.groupId}`);
      
      this.logger.log(`User ${client.userId} left group notifications: ${data.groupId}`);
      client.emit('left_group_notifications', { groupId: data.groupId });
      
    } catch (error) {
      this.logger.error(`Error leaving group notifications:`, error instanceof Error ? error.message : String(error));
      client.emit('error', { message: 'Failed to leave group notifications' });
    }
  }

  // Method to emit notification to specific user
  async emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
    this.logger.log(`Emitted ${event} to user ${userId}`);
  }

  // Method to emit notification to group members
  async emitToGroup(groupId: string, event: string, data: any) {
    this.server.to(`group_${groupId}`).emit(event, data);
    this.logger.log(`Emitted ${event} to group ${groupId}`);
  }

  // Method to emit notification to multiple users
  async emitToMultipleUsers(userIds: string[], event: string, data: any) {
    userIds.forEach(userId => {
      this.server.to(`user_${userId}`).emit(event, data);
    });
    this.logger.log(`Emitted ${event} to ${userIds.length} users`);
  }

  // Check if user is connected
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get all connected users
  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}