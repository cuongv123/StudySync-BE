import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('groups/:groupId/tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo task mới (chỉ nhóm trưởng)' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm', type: Number })
  @ApiResponse({ status: 201, description: 'Task đã được tạo thành công' })
  @ApiResponse({ status: 403, description: 'Chỉ nhóm trưởng mới có quyền giao task' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async createTask(
    @Param('groupId') groupId: string,
    @Request() req,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const userId = req.user.id;
    return await this.taskService.createTask(+groupId, userId, createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả tasks của nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm', type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách tasks' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async getTasksByGroup(@Param('groupId') groupId: string, @Request() req) {
    const userId = req.user.id;
    return await this.taskService.getTasksByGroup(+groupId, userId);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Lấy các tasks được giao cho tôi' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm', type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách tasks của tôi' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async getMyTasks(@Param('groupId') groupId: string, @Request() req) {
    const userId = req.user.id;
    return await this.taskService.getMyTasks(+groupId, userId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Lấy thống kê tasks của nhóm' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm', type: Number })
  @ApiResponse({ status: 200, description: 'Thống kê tasks' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async getTaskStatistics(@Param('groupId') groupId: string, @Request() req) {
    const userId = req.user.id;
    return await this.taskService.getTaskStatistics(+groupId, userId);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Lấy chi tiết một task' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm', type: Number })
  @ApiParam({ name: 'taskId', description: 'ID của task', type: Number })
  @ApiResponse({ status: 200, description: 'Chi tiết task' })
  @ApiResponse({ status: 404, description: 'Task không tồn tại' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  async getTaskById(
    @Param('groupId') groupId: string,
    @Param('taskId') taskId: string,
    @Request() req
  ) {
    const userId = req.user.id;
    return await this.taskService.getTaskById(+taskId, +groupId, userId);
  }

  @Put(':taskId')
  @ApiOperation({ summary: 'Cập nhật thông tin task (chỉ nhóm trưởng)' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm', type: Number })
  @ApiParam({ name: 'taskId', description: 'ID của task', type: Number })
  @ApiResponse({ status: 200, description: 'Task đã được cập nhật' })
  @ApiResponse({ status: 403, description: 'Chỉ nhóm trưởng mới có quyền chỉnh sửa' })
  @ApiResponse({ status: 404, description: 'Task không tồn tại' })
  async updateTask(
    @Param('groupId') groupId: string,
    @Param('taskId') taskId: string,
    @Request() req,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const userId = req.user.id;
    return await this.taskService.updateTask(+taskId, +groupId, userId, updateTaskDto);
  }

  @Put(':taskId/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái task (người được giao hoặc nhóm trưởng)' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm', type: Number })
  @ApiParam({ name: 'taskId', description: 'ID của task', type: Number })
  @ApiResponse({ status: 200, description: 'Trạng thái task đã được cập nhật' })
  @ApiResponse({ status: 403, description: 'Không có quyền cập nhật trạng thái' })
  @ApiResponse({ status: 404, description: 'Task không tồn tại' })
  async updateTaskStatus(
    @Param('groupId') groupId: string,
    @Param('taskId') taskId: string,
    @Request() req,
    @Body() updateStatusDto: UpdateTaskStatusDto,
  ) {
    const userId = req.user.id;
    return await this.taskService.updateTaskStatus(+taskId, +groupId, userId, updateStatusDto);
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa task (chỉ nhóm trưởng)' })
  @ApiParam({ name: 'groupId', description: 'ID của nhóm', type: Number })
  @ApiParam({ name: 'taskId', description: 'ID của task', type: Number })
  @ApiResponse({ status: 204, description: 'Task đã được xóa' })
  @ApiResponse({ status: 403, description: 'Chỉ nhóm trưởng mới có quyền xóa' })
  @ApiResponse({ status: 404, description: 'Task không tồn tại' })
  async deleteTask(
    @Param('groupId') groupId: string,
    @Param('taskId') taskId: string,
    @Request() req
  ) {
    const userId = req.user.id;
    await this.taskService.deleteTask(+taskId, +groupId, userId);
  }
}
