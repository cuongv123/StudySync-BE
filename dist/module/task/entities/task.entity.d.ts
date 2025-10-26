import { StudyGroup } from '../../group/entities/group.entity';
import { User } from '../../User/entities/User.entity';
import { TaskStatus, TaskPriority } from '../../../common/enums/task-status.enum';
export declare class Task {
    id: number;
    title: string;
    description: string;
    groupId: number;
    assignedBy: string;
    assignedTo: string;
    status: TaskStatus;
    priority: TaskPriority;
    deadline: Date;
    completedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    group: StudyGroup;
    assigner: User;
    assignee: User;
}
