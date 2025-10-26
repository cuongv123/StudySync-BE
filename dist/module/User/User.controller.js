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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const User_service_1 = require("./User.service");
const swagger_1 = require("@nestjs/swagger");
const role_enum_1 = require("../../common/enums/role.enum");
const roles_decorator_1 = require("../../decorator/roles.decorator");
const update_password_1 = require("./dto/update-password");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt.auth.guard");
const RolesGuard_1 = require("../auth/guards/RolesGuard");
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async updatePassword(req, dto) {
        const userId = req.user.id;
        return this.usersService.updatePassword(userId, dto);
    }
    async getProfile(req) {
        const userId = req.user.id;
        const user = await this.usersService.findOne(userId);
        const { password, tokenOTP, otpExpiry } = user, userResponse = __rest(user, ["password", "tokenOTP", "otpExpiry"]);
        return userResponse;
    }
    async updateProfile(req, updateProfileDto) {
        const userId = req.user.id;
        return this.usersService.updateUserProfile(userId, updateProfileDto);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Patch)('me/password'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.USER),
    (0, swagger_1.ApiOkResponse)({ schema: { example: { message: 'Password successfully updated' } } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_password_1.UpdatePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Get)('me/profile'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.USER),
    (0, swagger_1.ApiOkResponse)({
        description: 'Lấy thông tin profile của user hiện tại',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'user@example.com',
                username: 'john_doe',
                isVerified: true,
                role: ['user'],
                isActive: true,
                phoneNumber: '0123456789',
                studentId: 'SV001234',
                major: 'Công nghệ thông tin',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
            }
        }
    }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('me/profile'),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.USER),
    (0, swagger_1.ApiOkResponse)({
        description: 'Cập nhật profile thành công. Trả về tất cả thông tin user bao gồm email nhưng email không thể sửa',
        schema: {
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                email: 'user@example.com',
                username: 'john_doe_updated',
                isVerified: true,
                role: ['user'],
                isActive: true,
                phoneNumber: '0987654321',
                studentId: 'SV005678',
                major: 'Kỹ thuật phần mềm',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T12:00:00.000Z'
            }
        }
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, swagger_1.ApiTags)('User'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, RolesGuard_1.RolesGuard),
    __metadata("design:paramtypes", [User_service_1.UsersService])
], UsersController);
//# sourceMappingURL=User.controller.js.map