import { VideoCallService } from './video-call.service';
import { StartCallDto } from './dto/start-call.dto';
import { JoinCallDto } from './dto/join-call.dto';
export declare class VideoCallController {
    private readonly videoCallService;
    constructor(videoCallService: VideoCallService);
    startCall(req: any, startCallDto: StartCallDto): Promise<import("./entities/video-call.entity").VideoCall>;
    joinCall(req: any, id: number, joinCallDto: JoinCallDto): Promise<import("./entities/call-participant.entity").CallParticipant>;
    leaveCall(req: any, id: number): Promise<{
        message: string;
    }>;
    endCall(req: any, id: number): Promise<{
        message: string;
    }>;
    getCallDetails(req: any, id: number): Promise<import("./entities/video-call.entity").VideoCall>;
    getParticipants(id: number): Promise<import("./entities/call-participant.entity").CallParticipant[]>;
    getGroupActiveCalls(req: any, groupId: number): Promise<import("./entities/video-call.entity").VideoCall[]>;
    getCallHistory(req: any, groupId: number): Promise<import("./entities/video-call.entity").VideoCall[]>;
}
