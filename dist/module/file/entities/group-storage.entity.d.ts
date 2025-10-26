import { StudyGroup } from '../../group/entities/group.entity';
export declare class GroupStorage {
    id: number;
    groupId: number;
    group: StudyGroup;
    usedSpace: number;
    maxSpace: number;
    updatedAt: Date;
    get availableSpace(): number;
    get usedPercentage(): number;
}
