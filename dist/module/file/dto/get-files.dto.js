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
exports.GetFilesDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const file_type_enum_1 = require("../../../common/enums/file-type.enum");
class GetFilesDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.GetFilesDto = GetFilesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Trang số', example: 1, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetFilesDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Số lượng/trang', example: 20, minimum: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetFilesDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: file_type_enum_1.FileType,
        description: 'Lọc theo loại file',
        example: 'personal'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(file_type_enum_1.FileType),
    __metadata("design:type", String)
], GetFilesDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parent folder ID (null = root)',
        example: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GetFilesDto.prototype, "parentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Group ID (để lấy files của group)',
        example: 7
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], GetFilesDto.prototype, "groupId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tìm kiếm theo tên file',
        example: 'report'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetFilesDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Chỉ lấy folders',
        example: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], GetFilesDto.prototype, "foldersOnly", void 0);
//# sourceMappingURL=get-files.dto.js.map