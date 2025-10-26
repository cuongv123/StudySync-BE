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
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const token_entity_1 = require("./token.entity");
const User_entity_1 = require("../User/entities/User.entity");
let TokenService = class TokenService {
    constructor(tokenRepository, userRepository) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
    }
    async create(user, saveTokenDto) {
        let token = await this.tokenRepository.findOne({
            where: { user: { id: user.id } },
            relations: ['user'],
        });
        if (token) {
            token = Object.assign(Object.assign({}, token), saveTokenDto);
        }
        else {
            token = this.tokenRepository.create(Object.assign(Object.assign({}, saveTokenDto), { user }));
        }
        return await this.tokenRepository.save(token);
    }
    async update(token) {
        return await this.tokenRepository.save(token);
    }
    async findByRefreshTokenUsed(refreshToken) {
        return await this.tokenRepository
            .createQueryBuilder('token')
            .where(':refreshToken = ANY(token.refeshtokenused)', { refreshToken })
            .getOne();
    }
    async findByRefreshToken(refreshToken) {
        return await this.tokenRepository.findOne({
            where: { refreshToken },
            relations: ['user'],
        });
    }
    async findAccessToken(accessToken) {
        return await this.tokenRepository.findOne({
            where: { accessToken },
            relations: ['user'],
        });
    }
    async addUsedRefreshToken(userId, usedRefreshToken) {
        const token = await this.tokenRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!token)
            throw new common_1.BadRequestException('Token not found');
        token.refeshtokenused = [...(token.refeshtokenused || []), usedRefreshToken];
        return await this.tokenRepository.save(token);
    }
    async findByUserId(userId) {
        return await this.tokenRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
    }
    async deleteByUserId(userId) {
        var _a;
        const deleteResult = await this.tokenRepository.delete({ user: { id: userId } });
        return ((_a = deleteResult.affected) !== null && _a !== void 0 ? _a : 0) > 0;
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(token_entity_1.Token)),
    __param(1, (0, typeorm_1.InjectRepository)(User_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TokenService);
//# sourceMappingURL=token.service.js.map