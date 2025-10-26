import { User } from '../../User/entities/User.entity';
import { VideoCall } from './video-call.entity';
export declare class CallParticipant {
    id: number;
    callId: number;
    userId: string;
    peerId: string;
    joinedAt: Date;
    leftAt: Date;
    isActive: boolean;
    isMuted: boolean;
    isVideoOff: boolean;
    call: VideoCall;
    user: User;
}
