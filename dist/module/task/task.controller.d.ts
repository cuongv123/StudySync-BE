import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
export declare class TaskController {
    private readonly taskService;
    constructor(taskService: TaskService);
    createTask(groupId: string, req: any, createTaskDto: CreateTaskDto): Promise<import("./entities/task.entity").Task>;
    getTasksByGroup(groupId: string, req: any): Promise<import("./entities/task.entity").Task[]>;
    getMyTasks(groupId: string, req: any): Promise<import("./entities/task.entity").Task[]>;
    getTaskStatistics(groupId: string, req: any): Promise<{
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
        overdue: number;
    }>;
    getTaskById(groupId: string, taskId: string, req: any): Promise<import("./entities/task.entity").Task>;
    updateTask(groupId: string, taskId: string, req: any, updateTaskDto: UpdateTaskDto): Promise<import("./entities/task.entity").Task>;
    updateTaskStatus(groupId: string, taskId: string, req: any, updateStatusDto: UpdateTaskStatusDto): Promise<import("./entities/task.entity").Task>;
    deleteTask(groupId: string, taskId: string, req: any): Promise<void>;
}
