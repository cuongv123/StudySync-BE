import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { StudyGroup } from '../group/entities/group.entity';
import { GroupMember, MemberRole } from '../group/entities/group-member.entity';
import { TaskStatus } from '../../common/enums/task-status.enum';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(StudyGroup)
    private groupRepository: Repository<StudyGroup>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
  ) {}

  // Kiểm tra xem user có phải là leader của group không
  private async isGroupLeader(userId: string, groupId: number): Promise<boolean> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException(`Nhóm với ID ${groupId} không tồn tại`);
    }

    return group.leaderId === userId;
  }

  // Kiểm tra xem user có phải là thành viên của group không
  private async isGroupMember(userId: string, groupId: number): Promise<boolean> {
    const member = await this.groupMemberRepository.findOne({
      where: { userId, groupId },
    });

    return !!member;
  }

  // Tạo task mới (chỉ leader mới có quyền)
  async createTask(
    groupId: number,
    userId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    // Kiểm tra quyền leader
    const isLeader = await this.isGroupLeader(userId, groupId);
    if (!isLeader) {
      throw new ForbiddenException('Chỉ nhóm trưởng mới có quyền giao task');
    }

    // Kiểm tra người được giao có phải là thành viên không
    const isMember = await this.isGroupMember(createTaskDto.assignedTo, groupId);
    if (!isMember) {
      throw new BadRequestException('Người được giao task phải là thành viên của nhóm');
    }

    // Kiểm tra deadline phải ở tương lai
    const deadline = new Date(createTaskDto.deadline);
    if (deadline <= new Date()) {
      throw new BadRequestException('Deadline phải ở thời điểm tương lai');
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      groupId,
      assignedBy: userId,
      deadline,
    });

    return await this.taskRepository.save(task);
  }

  // Lấy tất cả tasks của một nhóm
  async getTasksByGroup(groupId: number, userId: string): Promise<Task[]> {
    // Kiểm tra user có phải thành viên của nhóm không
    const isMember = await this.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không có quyền xem tasks của nhóm này');
    }

    return await this.taskRepository.find({
      where: { groupId },
      relations: ['assignee', 'assigner'],
      order: { deadline: 'ASC' },
    });
  }

  // Lấy tasks được giao cho một user cụ thể trong nhóm
  async getMyTasks(groupId: number, userId: string): Promise<Task[]> {
    // Kiểm tra user có phải thành viên của nhóm không
    const isMember = await this.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải thành viên của nhóm này');
    }

    return await this.taskRepository.find({
      where: { groupId, assignedTo: userId },
      relations: ['assigner'],
      order: { deadline: 'ASC' },
    });
  }

  // Lấy chi tiết một task
  async getTaskById(taskId: number, groupId: number, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['assignee', 'assigner', 'group'],
    });

    if (!task) {
      throw new NotFoundException(`Task với ID ${taskId} không tồn tại`);
    }

    // Kiểm tra task có thuộc group này không
    if (task.groupId !== groupId) {
      throw new NotFoundException(`Task với ID ${taskId} không tồn tại trong nhóm này`);
    }

    // Kiểm tra user có quyền xem task này không
    const isMember = await this.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không có quyền xem task này');
    }

    return task;
  }

  // Cập nhật thông tin task (chỉ leader)
  async updateTask(
    taskId: number,
    groupId: number,
    userId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task với ID ${taskId} không tồn tại`);
    }

    // Kiểm tra task có thuộc group này không
    if (task.groupId !== groupId) {
      throw new NotFoundException(`Task với ID ${taskId} không tồn tại trong nhóm này`);
    }

    // Kiểm tra quyền leader
    const isLeader = await this.isGroupLeader(userId, groupId);
    if (!isLeader) {
      throw new ForbiddenException('Chỉ nhóm trưởng mới có quyền chỉnh sửa task');
    }

    // Kiểm tra deadline nếu được cập nhật
    if (updateTaskDto.deadline) {
      const deadline = new Date(updateTaskDto.deadline);
      if (deadline <= new Date()) {
        throw new BadRequestException('Deadline phải ở thời điểm tương lai');
      }
      updateTaskDto.deadline = deadline.toISOString();
    }

    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  // Cập nhật trạng thái task (người được giao có thể cập nhật)
  async updateTaskStatus(
    taskId: number,
    groupId: number,
    userId: string,
    updateStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task với ID ${taskId} không tồn tại`);
    }

    // Kiểm tra task có thuộc group này không
    if (task.groupId !== groupId) {
      throw new NotFoundException(`Task với ID ${taskId} không tồn tại trong nhóm này`);
    }

    // Kiểm tra quyền: chỉ người được giao hoặc leader mới có thể cập nhật trạng thái
    const isAssignee = task.assignedTo === userId;
    const isLeader = await this.isGroupLeader(userId, groupId);

    if (!isAssignee && !isLeader) {
      throw new ForbiddenException('Bạn không có quyền cập nhật trạng thái task này');
    }

    task.status = updateStatusDto.status;

    // Nếu status là COMPLETED, lưu thời điểm hoàn thành
    if (updateStatusDto.status === TaskStatus.COMPLETED) {
      task.completedAt = new Date();
    } else {
      task.completedAt = null;
    }

    return await this.taskRepository.save(task);
  }

  // Xóa task (chỉ leader)
  async deleteTask(taskId: number, groupId: number, userId: string): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task với ID ${taskId} không tồn tại`);
    }

    // Kiểm tra task có thuộc group này không
    if (task.groupId !== groupId) {
      throw new NotFoundException(`Task với ID ${taskId} không tồn tại trong nhóm này`);
    }

    // Kiểm tra quyền leader
    const isLeader = await this.isGroupLeader(userId, groupId);
    if (!isLeader) {
      throw new ForbiddenException('Chỉ nhóm trưởng mới có quyền xóa task');
    }

    await this.taskRepository.remove(task);
  }

  // Lấy thống kê tasks của nhóm
  async getTaskStatistics(groupId: number, userId: string) {
    // Kiểm tra user có phải thành viên của nhóm không
    const isMember = await this.isGroupMember(userId, groupId);
    if (!isMember) {
      throw new ForbiddenException('Bạn không có quyền xem thống kê của nhóm này');
    }

    const tasks = await this.taskRepository.find({
      where: { groupId },
    });

    const now = new Date();
    const statistics = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
      overdue: tasks.filter(
        t => t.deadline < now && t.status !== TaskStatus.COMPLETED,
      ).length,
    };

    return statistics;
  }
}
