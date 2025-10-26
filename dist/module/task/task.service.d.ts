import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { StudyGroup } from '../group/entities/group.entity';
import { GroupMember } from '../group/entities/group-member.entity';
export declare class TaskService {
    private taskRepository;
    private groupRepository;
    private groupMemberRepository;
    constructor(taskRepository: Repository<Task>, groupRepository: Repository<StudyGroup>, groupMemberRepository: Repository<GroupMember>);
    private isGroupLeader;
    private isGroupMember;
    createTask(groupId: number, userId: string, createTaskDto: CreateTaskDto): Promise<Task>;
    getTasksByGroup(groupId: number, userId: string): Promise<Task[]>;
    getMyTasks(groupId: number, userId: string): Promise<Task[]>;
    getTaskById(taskId: number, groupId: number, userId: string): Promise<Task>;
    updateTask(taskId: number, groupId: number, userId: string, updateTaskDto: UpdateTaskDto): Promise<Task>;
    updateTaskStatus(taskId: number, groupId: number, userId: string, updateStatusDto: UpdateTaskStatusDto): Promise<Task>;
    deleteTask(taskId: number, groupId: number, userId: string): Promise<void>;
    getTaskStatistics(groupId: number, userId: string): Promise<{
        total: number;
        pending: number;
        inProgress: number;
        completed: number;
        overdue: number;
    }>;
}
