import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { VideoCallService } from './video-call.service';

interface SignalingData {
  callId: number;
  fromUserId: string;
  toUserId?: string;
  signal: any; // SDP offer/answer or ICE candidate
  type: 'offer' | 'answer' | 'ice-candidate';
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/video-call',
})
export class VideoCallGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VideoCallGateway.name);
  private userSocketMap = new Map<string, string>(); // userId -> socketId
  private socketUserMap = new Map<string, string>(); // socketId -> userId

  constructor(private readonly videoCallService: VideoCallService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      // Remove user from active calls
      await this.videoCallService.handleUserDisconnect(userId);
      
      // Clean up maps
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(client.id);
      
      // Notify others in the call
      client.broadcast.emit('user-left', { userId });
    }
  }

  @SubscribeMessage('register-user')
  handleRegisterUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    const { userId } = data;
    this.userSocketMap.set(userId, client.id);
    this.socketUserMap.set(client.id, userId);
    
    this.logger.log(`User registered: ${userId} with socket ${client.id}`);
    return { success: true, userId };
  }

  @SubscribeMessage('join-call')
  async handleJoinCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: number; userId: string; peerId: string },
  ) {
    const { callId, userId, peerId } = data;
    
    this.logger.log(`User ${userId} joining call ${callId} with peer ${peerId}`);
    
    // Join socket room for this call
    const room = `call-${callId}`;
    await client.join(room);
    
    // Get current participants
    const participants = await this.videoCallService.getCallParticipants(callId);
    
    // Notify existing participants about new user
    client.to(room).emit('user-joined', {
      userId,
      peerId,
      user: participants.find(p => p.userId === userId)?.user,
    });
    
    return {
      success: true,
      participants: participants.filter(p => p.userId !== userId),
    };
  }

  @SubscribeMessage('leave-call')
  async handleLeaveCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: number; userId: string },
  ) {
    const { callId, userId } = data;
    
    this.logger.log(`User ${userId} leaving call ${callId}`);
    
    const room = `call-${callId}`;
    
    // Notify others
    client.to(room).emit('user-left', { userId });
    
    // Leave room
    await client.leave(room);
    
    // Update database
    await this.videoCallService.leaveCall(callId, userId);
    
    return { success: true };
  }

  @SubscribeMessage('signal')
  handleSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SignalingData,
  ) {
    const { callId, fromUserId, toUserId, signal, type } = data;
    
    this.logger.log(`Signal from ${fromUserId} to ${toUserId}: ${type}`);
    
    if (toUserId) {
      // Send to specific user
      const targetSocketId = this.userSocketMap.get(toUserId);
      if (targetSocketId) {
        this.server.to(targetSocketId).emit('signal', {
          fromUserId,
          signal,
          type,
        });
      }
    } else {
      // Broadcast to all in call
      const room = `call-${callId}`;
      client.to(room).emit('signal', {
        fromUserId,
        signal,
        type,
      });
    }
  }

  @SubscribeMessage('toggle-audio')
  handleToggleAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: number; userId: string; isMuted: boolean },
  ) {
    const { callId, userId, isMuted } = data;
    const room = `call-${callId}`;
    
    // Notify others
    client.to(room).emit('user-audio-changed', { userId, isMuted });
    
    // Update database
    this.videoCallService.updateParticipantAudio(callId, userId, isMuted);
    
    return { success: true };
  }

  @SubscribeMessage('toggle-video')
  handleToggleVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: number; userId: string; isVideoOff: boolean },
  ) {
    const { callId, userId, isVideoOff } = data;
    const room = `call-${callId}`;
    
    // Notify others
    client.to(room).emit('user-video-changed', { userId, isVideoOff });
    
    // Update database
    this.videoCallService.updateParticipantVideo(callId, userId, isVideoOff);
    
    return { success: true };
  }

  // Notify group members about new call
  notifyGroupCall(groupId: number, call: any) {
    this.server.emit('new-call', {
      groupId,
      call,
    });
  }

  // Notify call ended
  notifyCallEnded(callId: number) {
    const room = `call-${callId}`;
    this.server.to(room).emit('call-ended', { callId });
  }
}
