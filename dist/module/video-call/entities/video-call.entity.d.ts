import { User } from '../../User/entities/User.entity';
import { StudyGroup } from '../../group/entities/group.entity';
import { CallParticipant } from './call-participant.entity';
import { CallStatus } from '../../../common/enums/call-status.enum';
export declare class VideoCall {
    id: number;
    groupId: number;
    callTitle: string;
    startedBy: string;
    status: CallStatus;
    startedAt: Date;
    endedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    group: StudyGroup;
    starter: User;
    participants: CallParticipant[];
}
