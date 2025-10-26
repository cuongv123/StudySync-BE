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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const role_enum_1 = require("../../../common/enums/role.enum");
let User = class User {
};
exports.User = User;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "tokenOTP", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "otpExpiry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: role_enum_1.Role, isArray: true }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: role_enum_1.Role,
        array: true,
        default: [role_enum_1.Role.USER],
    }),
    __metadata("design:type", Array)
], User.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Số điện thoại của user',
        example: '0123456789'
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 15, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mã số sinh viên',
        example: 'SV001234'
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Chuyên ngành của sinh viên',
        example: 'Công nghệ thông tin'
    }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "major", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=User.entity.js.map