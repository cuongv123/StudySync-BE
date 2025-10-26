"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const file_controller_1 = require("./file.controller");
const file_service_1 = require("./file.service");
const file_entity_1 = require("./entities/file.entity");
const user_storage_entity_1 = require("./entities/user-storage.entity");
const group_storage_entity_1 = require("./entities/group-storage.entity");
const group_member_entity_1 = require("../group/entities/group-member.entity");
let FileModule = class FileModule {
};
exports.FileModule = FileModule;
exports.FileModule = FileModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([file_entity_1.File, user_storage_entity_1.UserStorage, group_storage_entity_1.GroupStorage, group_member_entity_1.GroupMember]),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: (req, file, cb) => {
                        const uploadPath = './uploads';
                        cb(null, uploadPath);
                    },
                    filename: (req, file, cb) => {
                        const randomName = Array(32)
                            .fill(null)
                            .map(() => Math.round(Math.random() * 16).toString(16))
                            .join('');
                        cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
                    },
                }),
                limits: {
                    fileSize: 1073741824,
                },
            }),
        ],
        controllers: [file_controller_1.FileController],
        providers: [file_service_1.FileService],
        exports: [file_service_1.FileService],
    })
], FileModule);
//# sourceMappingURL=file.module.js.map