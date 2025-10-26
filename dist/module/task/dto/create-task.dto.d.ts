import { TaskPriority } from '../../../common/enums/task-status.enum';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    assignedTo: string;
    deadline: string;
    priority?: TaskPriority;
}
