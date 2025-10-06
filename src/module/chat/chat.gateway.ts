import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

// Store connected users: Map<userId, Set<socketId>>
const connectedUsers = new Map<string, Set<string>>();

// Store user's current room: Map<socketId, groupId>
const userRooms = new Map<string, number>();

@WebSocketGateway({
  cors: {
    origin: '*', // Trong production nên giới hạn domain cụ thể
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  // Khi client connect
  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.auth.userId || client.handshake.query.userId;

      if (!userId) {
        console.log('❌ Connection rejected: No userId provided');
        client.disconnect();
        return;
      }

      // Lưu socket vào map
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId)?.add(client.id);

      console.log(`✅ User ${userId} connected with socket ${client.id}`);
      console.log(`📊 Total connected users: ${connectedUsers.size}`);

      // Emit online status
      this.server.emit('user:online', { userId });
    } catch (error) {
      console.error('Error in handleConnection:', error);
      client.disconnect();
    }
  }

  // Khi client disconnect
  async handleDisconnect(client: Socket) {
    try {
      const userId = client.handshake.auth.userId || client.handshake.query.userId;

      if (userId && connectedUsers.has(userId)) {
        const userSockets = connectedUsers.get(userId);
        userSockets?.delete(client.id);

        // Nếu user không còn socket nào connect
        if (userSockets?.size === 0) {
          connectedUsers.delete(userId);
          this.server.emit('user:offline', { userId });
          console.log(`🔴 User ${userId} went offline`);
        }
      }

      // Remove from room tracking
      const groupId = userRooms.get(client.id);
      if (groupId) {
        client.leave(`group:${groupId}`);
        userRooms.delete(client.id);
      }

      console.log(`👋 Socket ${client.id} disconnected`);
      console.log(`📊 Remaining connected users: ${connectedUsers.size}`);
    } catch (error) {
      console.error('Error in handleDisconnect:', error);
    }
  }

  // Join group chat room
  @SubscribeMessage('chat:join')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number },
  ) {
    try {
      const userId = client.handshake.auth.userId || client.handshake.query.userId;
      const { groupId } = data;

      if (!userId || !groupId) {
        return { success: false, message: 'Missing userId or groupId' };
      }

      // Leave previous room if exists
      const previousRoom = userRooms.get(client.id);
      if (previousRoom) {
        client.leave(`group:${previousRoom}`);
      }

      // Join new room
      const roomName = `group:${groupId}`;
      client.join(roomName);
      userRooms.set(client.id, groupId);

      console.log(`🚪 User ${userId} joined room ${roomName}`);

      // Notify others in room
      client.to(roomName).emit('user:joined', {
        userId,
        groupId,
        timestamp: new Date(),
      });

      return {
        success: true,
        message: `Joined group ${groupId}`,
        groupId,
      };
    } catch (error) {
      console.error('Error in handleJoinRoom:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Leave group chat room
  @SubscribeMessage('chat:leave')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number },
  ) {
    try {
      const userId = client.handshake.auth.userId || client.handshake.query.userId;
      const { groupId } = data;

      const roomName = `group:${groupId}`;
      client.leave(roomName);
      userRooms.delete(client.id);

      console.log(`👋 User ${userId} left room ${roomName}`);

      // Notify others
      client.to(roomName).emit('user:left', {
        userId,
        groupId,
        timestamp: new Date(),
      });

      return { success: true, message: `Left group ${groupId}` };
    } catch (error) {
      console.error('Error in handleLeaveRoom:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send message (real-time)
  @SubscribeMessage('chat:send')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number; message: CreateMessageDto },
  ) {
    try {
      const userId = client.handshake.auth.userId || client.handshake.query.userId;
      const { groupId, message } = data;

      if (!userId || !groupId || !message) {
        return { success: false, message: 'Missing required data' };
      }

      // Save message to database
      const savedMessage = await this.chatService.sendMessage(
        userId,
        groupId,
        message,
      );

      // Load full message with relations
      const fullMessage = await this.chatService.getMessageById(
        userId,
        groupId,
        savedMessage.id,
      );

      // Broadcast to all users in the room (including sender)
      const roomName = `group:${groupId}`;
      this.server.to(roomName).emit('chat:message', {
        message: fullMessage,
        groupId,
      });

      console.log(`💬 Message sent to group ${groupId} by user ${userId}`);

      return {
        success: true,
        message: fullMessage,
      };
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  }

  // Update message
  @SubscribeMessage('chat:update')
  async handleUpdateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      groupId: number;
      messageId: number;
      content: UpdateMessageDto;
    },
  ) {
    try {
      const userId = client.handshake.auth.userId || client.handshake.query.userId;
      const { groupId, messageId, content } = data;

      const updatedMessage = await this.chatService.updateMessage(
        userId,
        groupId,
        messageId,
        content,
      );

      // Broadcast update to room
      const roomName = `group:${groupId}`;
      this.server.to(roomName).emit('chat:updated', {
        message: updatedMessage,
        groupId,
      });

      console.log(`✏️ Message ${messageId} updated in group ${groupId}`);

      return { success: true, message: updatedMessage };
    } catch (error) {
      console.error('Error in handleUpdateMessage:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Delete message
  @SubscribeMessage('chat:delete')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number; messageId: number },
  ) {
    try {
      const userId = client.handshake.auth.userId || client.handshake.query.userId;
      const { groupId, messageId } = data;

      await this.chatService.deleteMessage(userId, groupId, messageId);

      // Broadcast deletion to room
      const roomName = `group:${groupId}`;
      this.server.to(roomName).emit('chat:deleted', {
        messageId,
        groupId,
      });

      console.log(`🗑️ Message ${messageId} deleted in group ${groupId}`);

      return { success: true, messageId };
    } catch (error) {
      console.error('Error in handleDeleteMessage:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Typing indicator
  @SubscribeMessage('chat:typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number; isTyping: boolean },
  ) {
    try {
      const userId = client.handshake.auth.userId || client.handshake.query.userId;
      const { groupId, isTyping } = data;

      const roomName = `group:${groupId}`;

      // Broadcast to others (not including sender)
      client.to(roomName).emit('user:typing', {
        userId,
        groupId,
        isTyping,
      });

      return { success: true };
    } catch (error) {
      console.error('Error in handleTyping:', error);
      return { success: false };
    }
  }

  // Get online users in a group
  @SubscribeMessage('chat:getOnlineUsers')
  async handleGetOnlineUsers(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number },
  ) {
    try {
      const { groupId } = data;
      const roomName = `group:${groupId}`;

      // Get all sockets in the room
      const room = this.server.sockets.adapter.rooms.get(roomName);
      const onlineUserIds = new Set<string>();

      if (room) {
        room.forEach((socketId) => {
          const socket = this.server.sockets.sockets.get(socketId);
          if (socket) {
            const userId =
              socket.handshake.auth.userId || socket.handshake.query.userId;
            if (userId) {
              onlineUserIds.add(userId);
            }
          }
        });
      }

      return {
        success: true,
        onlineUsers: Array.from(onlineUserIds),
        count: onlineUserIds.size,
      };
    } catch (error) {
      console.error('Error in handleGetOnlineUsers:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
