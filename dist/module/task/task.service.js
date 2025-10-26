"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
const group_entity_1 = require("../group/entities/group.entity");
const group_member_entity_1 = require("../group/entities/group-member.entity");
const task_status_enum_1 = require("../../common/enums/task-status.enum");
let TaskService = class TaskService {
    constructor(taskRepository, groupRepository, groupMemberRepository) {
        this.taskRepository = taskRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
    }
    async isGroupLeader(userId, groupId) {
        const group = await this.groupRepository.findOne({
            where: { id: groupId },
        });
        if (!group) {
            throw new common_1.NotFoundException(`Nhóm với ID ${groupId} không tồn tại`);
        }
        return group.leaderId === userId;
    }
    async isGroupMember(userId, groupId) {
        const member = await this.groupMemberRepository.findOne({
            where: { userId, groupId },
        });
        return !!member;
    }
    async createTask(groupId, userId, createTaskDto) {
        const isLeader = await this.isGroupLeader(userId, groupId);
        if (!isLeader) {
            throw new common_1.ForbiddenException('Chỉ nhóm trưởng mới có quyền giao task');
        }
        const isMember = await this.isGroupMember(createTaskDto.assignedTo, groupId);
        if (!isMember) {
            throw new common_1.BadRequestException('Người được giao task phải là thành viên của nhóm');
        }
        const deadline = new Date(createTaskDto.deadline);
        if (deadline <= new Date()) {
            throw new common_1.BadRequestException('Deadline phải ở thời điểm tương lai');
        }
        const task = this.taskRepository.create(Object.assign(Object.assign({}, createTaskDto), { groupId, assignedBy: userId, deadline }));
        return await this.taskRepository.save(task);
    }
    async getTasksByGroup(groupId, userId) {
        const isMember = await this.isGroupMember(userId, groupId);
        if (!isMember) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem tasks của nhóm này');
        }
        return await this.taskRepository.find({
            where: { groupId },
            relations: ['assignee', 'assigner'],
            order: { deadline: 'ASC' },
        });
    }
    async getMyTasks(groupId, userId) {
        const isMember = await this.isGroupMember(userId, groupId);
        if (!isMember) {
            throw new common_1.ForbiddenException('Bạn không phải thành viên của nhóm này');
        }
        return await this.taskRepository.find({
            where: { groupId, assignedTo: userId },
            relations: ['assigner'],
            order: { deadline: 'ASC' },
        });
    }
    async getTaskById(taskId, groupId, userId) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['assignee', 'assigner', 'group'],
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task với ID ${taskId} không tồn tại`);
        }
        if (task.groupId !== groupId) {
            throw new common_1.NotFoundException(`Task với ID ${taskId} không tồn tại trong nhóm này`);
        }
        const isMember = await this.isGroupMember(userId, groupId);
        if (!isMember) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem task này');
        }
        return task;
    }
    async updateTask(taskId, groupId, userId, updateTaskDto) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task với ID ${taskId} không tồn tại`);
        }
        if (task.groupId !== groupId) {
            throw new common_1.NotFoundException(`Task với ID ${taskId} không tồn tại trong nhóm này`);
        }
        const isLeader = await this.isGroupLeader(userId, groupId);
        if (!isLeader) {
            throw new common_1.ForbiddenException('Chỉ nhóm trưởng mới có quyền chỉnh sửa task');
        }
        if (updateTaskDto.deadline) {
            const deadline = new Date(updateTaskDto.deadline);
            if (deadline <= new Date()) {
                throw new common_1.BadRequestException('Deadline phải ở thời điểm tương lai');
            }
            updateTaskDto.deadline = deadline.toISOString();
        }
        Object.assign(task, updateTaskDto);
        return await this.taskRepository.save(task);
    }
    async updateTaskStatus(taskId, groupId, userId, updateStatusDto) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task với ID ${taskId} không tồn tại`);
        }
        if (task.groupId !== groupId) {
            throw new common_1.NotFoundException(`Task với ID ${taskId} không tồn tại trong nhóm này`);
        }
        const isAssignee = task.assignedTo === userId;
        const isLeader = await this.isGroupLeader(userId, groupId);
        if (!isAssignee && !isLeader) {
            throw new common_1.ForbiddenException('Bạn không có quyền cập nhật trạng thái task này');
        }
        task.status = updateStatusDto.status;
        if (updateStatusDto.status === task_status_enum_1.TaskStatus.COMPLETED) {
            task.completedAt = new Date();
        }
        else {
            task.completedAt = null;
        }
        return await this.taskRepository.save(task);
    }
    async deleteTask(taskId, groupId, userId) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task với ID ${taskId} không tồn tại`);
        }
        if (task.groupId !== groupId) {
            throw new common_1.NotFoundException(`Task với ID ${taskId} không tồn tại trong nhóm này`);
        }
        const isLeader = await this.isGroupLeader(userId, groupId);
        if (!isLeader) {
            throw new common_1.ForbiddenException('Chỉ nhóm trưởng mới có quyền xóa task');
        }
        await this.taskRepository.remove(task);
    }
    async getTaskStatistics(groupId, userId) {
        const isMember = await this.isGroupMember(userId, groupId);
        if (!isMember) {
            throw new common_1.ForbiddenException('Bạn không có quyền xem thống kê của nhóm này');
        }
        const tasks = await this.taskRepository.find({
            where: { groupId },
        });
        const now = new Date();
        const statistics = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === task_status_enum_1.TaskStatus.PENDING).length,
            inProgress: tasks.filter(t => t.status === task_status_enum_1.TaskStatus.IN_PROGRESS).length,
            completed: tasks.filter(t => t.status === task_status_enum_1.TaskStatus.COMPLETED).length,
            overdue: tasks.filter(t => t.deadline < now && t.status !== task_status_enum_1.TaskStatus.COMPLETED).length,
        };
        return statistics;
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(group_entity_1.StudyGroup)),
    __param(2, (0, typeorm_1.InjectRepository)(group_member_entity_1.GroupMember)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TaskService);
//# sourceMappingURL=task.service.js.map