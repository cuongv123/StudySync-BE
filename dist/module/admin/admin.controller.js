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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
const RolesGuard_1 = require("../auth/guards/RolesGuard");
const roles_decorator_1 = require("../../decorator/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const admin_service_1 = require("./admin.service");
const assign_role_dto_1 = require("../User/dto/assign-role.dto");
const reset_password_1 = require("../User/dto/reset-password");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboard() {
        return this.adminService.getDashboard();
    }
    async getAllUsers(query) {
        return this.adminService.listUsers(query);
    }
    async getUserById(id) {
        return this.adminService.getUserById(id);
    }
    async resetUserPassword(id, dto) {
        return this.adminService.resetUserPassword(id, dto.newPassword);
    }
    async deleteUser(id) {
        return this.adminService.deleteUser(id);
    }
    async assignRole(dto) {
        return this.adminService.assignRole(dto.userId, dto.role);
    }
    async getTotalRevenue() {
        return this.adminService.getTotalRevenue();
    }
    async getSubscriptionStats() {
        return this.adminService.getSubscriptionStats();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, swagger_1.ApiOkResponse)({ description: 'Lấy thống kê tổng quan cho admin dashboard' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, swagger_1.ApiOkResponse)({ description: 'Lấy danh sách tất cả users' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Lấy thông tin chi tiết user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Patch)('users/:id/password'),
    (0, swagger_1.ApiOkResponse)({ description: 'Reset password cho user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reset_password_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "resetUserPassword", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, swagger_1.ApiOkResponse)({ description: 'Xóa user' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Patch)('users/assign-role'),
    (0, swagger_1.ApiOkResponse)({ description: 'Gán role cho user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_role_dto_1.AssignRoleDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "assignRole", null);
__decorate([
    (0, common_1.Get)('revenue/total'),
    (0, swagger_1.ApiOkResponse)({ description: 'Lấy tổng doanh thu' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTotalRevenue", null);
__decorate([
    (0, common_1.Get)('subscriptions/stats'),
    (0, swagger_1.ApiOkResponse)({ description: 'Lấy thống kê subscriptions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSubscriptionStats", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, RolesGuard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map