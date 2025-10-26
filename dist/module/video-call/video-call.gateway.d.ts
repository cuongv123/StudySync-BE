import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VideoCallService } from './video-call.service';
interface SignalingData {
    callId: number;
    fromUserId: string;
    toUserId?: string;
    signal: any;
    type: 'offer' | 'answer' | 'ice-candidate';
}
export declare class VideoCallGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly videoCallService;
    server: Server;
    private readonly logger;
    private userSocketMap;
    private socketUserMap;
    constructor(videoCallService: VideoCallService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): Promise<void>;
    handleRegisterUser(client: Socket, data: {
        userId: string;
    }): {
        success: boolean;
        userId: string;
    };
    handleJoinCall(client: Socket, data: {
        callId: number;
        userId: string;
        peerId: string;
    }): Promise<{
        success: boolean;
        participants: import("./entities/call-participant.entity").CallParticipant[];
    }>;
    handleLeaveCall(client: Socket, data: {
        callId: number;
        userId: string;
    }): Promise<{
        success: boolean;
    }>;
    handleSignal(client: Socket, data: SignalingData): void;
    handleToggleAudio(client: Socket, data: {
        callId: number;
        userId: string;
        isMuted: boolean;
    }): {
        success: boolean;
    };
    handleToggleVideo(client: Socket, data: {
        callId: number;
        userId: string;
        isVideoOff: boolean;
    }): {
        success: boolean;
    };
    notifyGroupCall(groupId: number, call: any): void;
    notifyCallEnded(callId: number): void;
}
export {};
