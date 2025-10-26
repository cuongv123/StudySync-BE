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
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const task_service_1 = require("./task.service");
const create_task_dto_1 = require("./dto/create-task.dto");
const update_task_dto_1 = require("./dto/update-task.dto");
const update_task_status_dto_1 = require("./dto/update-task-status.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
let TaskController = class TaskController {
    constructor(taskService) {
        this.taskService = taskService;
    }
    async createTask(groupId, req, createTaskDto) {
        const userId = req.user.id;
        return await this.taskService.createTask(+groupId, userId, createTaskDto);
    }
    async getTasksByGroup(groupId, req) {
        const userId = req.user.id;
        return await this.taskService.getTasksByGroup(+groupId, userId);
    }
    async getMyTasks(groupId, req) {
        const userId = req.user.id;
        return await this.taskService.getMyTasks(+groupId, userId);
    }
    async getTaskStatistics(groupId, req) {
        const userId = req.user.id;
        return await this.taskService.getTaskStatistics(+groupId, userId);
    }
    async getTaskById(groupId, taskId, req) {
        const userId = req.user.id;
        return await this.taskService.getTaskById(+taskId, +groupId, userId);
    }
    async updateTask(groupId, taskId, req, updateTaskDto) {
        const userId = req.user.id;
        return await this.taskService.updateTask(+taskId, +groupId, userId, updateTaskDto);
    }
    async updateTaskStatus(groupId, taskId, req, updateStatusDto) {
        const userId = req.user.id;
        return await this.taskService.updateTaskStatus(+taskId, +groupId, userId, updateStatusDto);
    }
    async deleteTask(groupId, taskId, req) {
        const userId = req.user.id;
        await this.taskService.deleteTask(+taskId, +groupId, userId);
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo task mới (chỉ nhóm trưởng)' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: 'ID của nhóm', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Task đã được tạo thành công' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Chỉ nhóm trưởng mới có quyền giao task' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "createTask", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy tất cả tasks của nhóm' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: 'ID của nhóm', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách tasks' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getTasksByGroup", null);
__decorate([
    (0, common_1.Get)('my-tasks'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy các tasks được giao cho tôi' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: 'ID của nhóm', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Danh sách tasks của tôi' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getMyTasks", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thống kê tasks của nhóm' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: 'ID của nhóm', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thống kê tasks' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getTaskStatistics", null);
__decorate([
    (0, common_1.Get)(':taskId'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết một task' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: 'ID của nhóm', type: Number }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'ID của task', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chi tiết task' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task không tồn tại' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền truy cập' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "getTaskById", null);
__decorate([
    (0, common_1.Put)(':taskId'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin task (chỉ nhóm trưởng)' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: 'ID của nhóm', type: Number }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'ID của task', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Task đã được cập nhật' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Chỉ nhóm trưởng mới có quyền chỉnh sửa' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task không tồn tại' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, update_task_dto_1.UpdateTaskDto]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Put)(':taskId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật trạng thái task (người được giao hoặc nhóm trưởng)' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: 'ID của nhóm', type: Number }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'ID của task', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trạng thái task đã được cập nhật' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Không có quyền cập nhật trạng thái' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task không tồn tại' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, update_task_status_dto_1.UpdateTaskStatusDto]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "updateTaskStatus", null);
__decorate([
    (0, common_1.Delete)(':taskId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa task (chỉ nhóm trưởng)' }),
    (0, swagger_1.ApiParam)({ name: 'groupId', description: 'ID của nhóm', type: Number }),
    (0, swagger_1.ApiParam)({ name: 'taskId', description: 'ID của task', type: Number }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Task đã được xóa' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Chỉ nhóm trưởng mới có quyền xóa' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Task không tồn tại' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "deleteTask", null);
exports.TaskController = TaskController = __decorate([
    (0, swagger_1.ApiTags)('Tasks'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('groups/:groupId/tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [task_service_1.TaskService])
], TaskController);
//# sourceMappingURL=task.controller.js.map