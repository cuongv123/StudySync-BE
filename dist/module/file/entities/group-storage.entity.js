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
exports.GroupStorage = void 0;
const typeorm_1 = require("typeorm");
const group_entity_1 = require("../../group/entities/group.entity");
let GroupStorage = class GroupStorage {
    get availableSpace() {
        return this.maxSpace - this.usedSpace;
    }
    get usedPercentage() {
        return (this.usedSpace / this.maxSpace) * 100;
    }
};
exports.GroupStorage = GroupStorage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GroupStorage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", Number)
], GroupStorage.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => group_entity_1.StudyGroup),
    (0, typeorm_1.JoinColumn)({ name: 'groupId' }),
    __metadata("design:type", group_entity_1.StudyGroup)
], GroupStorage.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 0 }),
    __metadata("design:type", Number)
], GroupStorage.prototype, "usedSpace", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 1073741824 }),
    __metadata("design:type", Number)
], GroupStorage.prototype, "maxSpace", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GroupStorage.prototype, "updatedAt", void 0);
exports.GroupStorage = GroupStorage = __decorate([
    (0, typeorm_1.Entity)('group_storage')
], GroupStorage);
//# sourceMappingURL=group-storage.entity.js.map