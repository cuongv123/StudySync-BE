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
exports.UserStorage = void 0;
const typeorm_1 = require("typeorm");
const User_entity_1 = require("../../User/entities/User.entity");
let UserStorage = class UserStorage {
    get availableSpace() {
        return this.maxSpace - this.usedSpace;
    }
    get usedPercentage() {
        return (this.usedSpace / this.maxSpace) * 100;
    }
};
exports.UserStorage = UserStorage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserStorage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { unique: true }),
    __metadata("design:type", String)
], UserStorage.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => User_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_entity_1.User)
], UserStorage.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 0 }),
    __metadata("design:type", Number)
], UserStorage.prototype, "usedSpace", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { default: 104857600 }),
    __metadata("design:type", Number)
], UserStorage.prototype, "maxSpace", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], UserStorage.prototype, "updatedAt", void 0);
exports.UserStorage = UserStorage = __decorate([
    (0, typeorm_1.Entity)('user_storage')
], UserStorage);
//# sourceMappingURL=user-storage.entity.js.map