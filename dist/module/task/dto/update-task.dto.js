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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTaskDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const task_status_enum_1 = require("../../../common/enums/task-status.enum");
class UpdateTaskDto {
}
exports.UpdateTaskDto = UpdateTaskDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tiêu đề của task',
        example: 'Hoàn thành báo cáo chương 1 (cập nhật)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Mô tả chi tiết về task',
        example: 'Viết báo cáo chương 1 về tổng quan dự án',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Thời hạn hoàn thành (ISO 8601 format)',
        example: '2025-10-20T23:59:59.000Z',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "deadline", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Độ ưu tiên của task',
        enum: task_status_enum_1.TaskPriority,
        example: task_status_enum_1.TaskPriority.URGENT,
    }),
    (0, class_validator_1.IsEnum)(task_status_enum_1.TaskPriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "priority", void 0);
//# sourceMappingURL=update-task.dto.js.map