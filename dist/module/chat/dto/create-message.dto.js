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
exports.CreateMessageDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const message_entity_1 = require("../entities/message.entity");
class AttachmentDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tên file', example: 'document.pdf' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttachmentDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'URL file', example: 'https://storage.example.com/file.pdf' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttachmentDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Kích thước file (bytes)', example: 1024000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AttachmentDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'MIME type', example: 'application/pdf' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttachmentDto.prototype, "mimeType", void 0);
class CreateMessageDto {
}
exports.CreateMessageDto = CreateMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nội dung tin nhắn',
        example: 'Hello everyone! Let\'s start our study session.',
        maxLength: 5000
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nội dung tin nhắn không được để trống' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(5000, { message: 'Nội dung tin nhắn không được quá 5000 ký tự' }),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Loại tin nhắn',
        enum: message_entity_1.MessageType,
        default: message_entity_1.MessageType.TEXT,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(message_entity_1.MessageType),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Danh sách file đính kèm',
        type: [AttachmentDto],
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AttachmentDto),
    __metadata("design:type", Array)
], CreateMessageDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID tin nhắn được reply',
        example: 123,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateMessageDto.prototype, "replyToId", void 0);
//# sourceMappingURL=create-message.dto.js.map