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
exports.CreateGroupDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateGroupDto {
}
exports.CreateGroupDto = CreateGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tên nhóm học',
        example: 'Nhóm học Toán A1',
        maxLength: 100,
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên nhóm không được để trống' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100, { message: 'Tên nhóm không được vượt quá 100 ký tự' }),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "groupName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mô tả về nhóm',
        example: 'Nhóm học chung môn Toán cao cấp ',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Mã môn học',
        example: 'MATH101',
        required: false,
        maxLength: 50,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50, { message: 'Mã môn học không được vượt quá 50 ký tự' }),
    __metadata("design:type", String)
], CreateGroupDto.prototype, "subject", void 0);
//# sourceMappingURL=create-group.dto.js.map