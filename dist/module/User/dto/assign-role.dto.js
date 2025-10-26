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
exports.AssignRoleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const role_enum_1 = require("../../../common/enums/role.enum");
class AssignRoleDto {
}
exports.AssignRoleDto = AssignRoleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID của user cần cấp quyền',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)('4', { message: 'User ID phải là UUID hợp lệ' }),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Chọn role cho user: "user" - Người dùng thông thường, "admin" - Quản trị viên hệ thống',
        example: role_enum_1.Role.ADMIN,
        enum: role_enum_1.Role,
        enumName: 'UserRole',
        default: role_enum_1.Role.USER,
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Vui lòng chọn role' }),
    (0, class_validator_1.IsEnum)(role_enum_1.Role, { message: 'Role không hợp lệ. Vui lòng chọn user hoặc admin' }),
    __metadata("design:type", String)
], AssignRoleDto.prototype, "role", void 0);
//# sourceMappingURL=assign-role.dto.js.map