import { TaskPriority } from '../../../common/enums/task-status.enum';
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    deadline?: string;
    priority?: TaskPriority;
}
