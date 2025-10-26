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
exports.AdminUsersController = void 0;
const common_1 = require("@nestjs/common");
const User_service_1 = require("./User.service");
const swagger_1 = require("@nestjs/swagger");
const role_enum_1 = require("../../common/enums/role.enum");
const roles_decorator_1 = require("../../decorator/roles.decorator");
const reset_password_1 = require("./dto/reset-password");
const assign_role_dto_1 = require("./dto/assign-role.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
const RolesGuard_1 = require("../auth/guards/RolesGuard");
let AdminUsersController = class AdminUsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async findAll() {
        return this.usersService.findAll();
    }
    async findOneById(id) {
        return this.usersService.findOne(id);
    }
    async resetPassword(id, dto) {
        return this.usersService.resetPassword(id, dto.newPassword);
    }
    async delete(id) {
        return this.usersService.remove(id);
    }
    async assignRole(assignRoleDto) {
        return this.usersService.assignRole(assignRoleDto.userId, assignRoleDto.role);
    }
};
exports.AdminUsersController = AdminUsersController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "findOneById", null);
__decorate([
    (0, common_1.Patch)(':id/password'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOkResponse)({ schema: { example: { message: 'Password reset successfully' } } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reset_password_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)('assign-role'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.ADMIN),
    (0, swagger_1.ApiOkResponse)({
        description: 'Cập nhật role thành công',
        schema: {
            example: {
                message: 'Role đã được cập nhật thành công',
                user: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    username: 'username',
                    email: 'user@example.com',
                    role: ['admin']
                }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_role_dto_1.AssignRoleDto]),
    __metadata("design:returntype", Promise)
], AdminUsersController.prototype, "assignRole", null);
exports.AdminUsersController = AdminUsersController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, swagger_1.ApiTags)('Admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, RolesGuard_1.RolesGuard),
    __metadata("design:paramtypes", [User_service_1.UsersService])
], AdminUsersController);
//# sourceMappingURL=admin.controller.js.map