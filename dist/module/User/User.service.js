"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const User_entity_1 = require("./entities/User.entity");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findAll() {
        return this.userRepository.find();
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findByUsername(username) {
        return this.userRepository.findOne({ where: { username } });
    }
    async updateProfile(userId, dto) {
        const user = await this.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.email) {
            const existing = await this.findByEmail(dto.email);
            if (existing && existing.id !== userId) {
                throw new common_1.BadRequestException('Email already exists');
            }
            user.email = dto.email;
        }
        if (dto.username) {
            const existing = await this.findByUsername(dto.username);
            if (existing && existing.id !== userId) {
                throw new common_1.BadRequestException('Username already exists');
            }
            user.username = dto.username;
        }
        return this.userRepository.save(user);
    }
    async updateUserProfile(userId, dto) {
        const user = await this.findOne(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.username && dto.username !== user.username) {
            const existingUser = await this.findByUsername(dto.username);
            if (existingUser && existingUser.id !== userId) {
                throw new common_1.BadRequestException('Username đã tồn tại');
            }
        }
        if (dto.studentId && dto.studentId !== user.studentId) {
            const existingUser = await this.userRepository.findOne({ where: { studentId: dto.studentId } });
            if (existingUser && existingUser.id !== userId) {
                throw new common_1.BadRequestException('Mã số sinh viên đã tồn tại');
            }
        }
        if (dto.username)
            user.username = dto.username;
        if (dto.phoneNumber !== undefined)
            user.phoneNumber = dto.phoneNumber;
        if (dto.studentId !== undefined)
            user.studentId = dto.studentId;
        if (dto.major !== undefined)
            user.major = dto.major;
        const updatedUser = await this.userRepository.save(user);
        const { password, tokenOTP, otpExpiry } = updatedUser, userResponse = __rest(updatedUser, ["password", "tokenOTP", "otpExpiry"]);
        return userResponse;
    }
    async updatePassword(userId, dto) {
        const user = await this.findOne(userId);
        const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isMatch)
            throw new common_1.BadRequestException('Old password is incorrect');
        user.password = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepository.save(user);
        return { message: 'Password successfully updated' };
    }
    async resetPassword(userId, newPassword) {
        const user = await this.findOne(userId);
        user.password = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);
        return { message: 'Password reset successfully' };
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
        return { message: 'User deleted successfully' };
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async create(userData) {
        const newUser = this.userRepository.create(userData);
        return this.userRepository.save(newUser);
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.email) {
            const existing = await this.findByEmail(updateUserDto.email);
            if (existing && existing.id !== id) {
                throw new common_1.BadRequestException('Email already exists');
            }
        }
        if (updateUserDto.username) {
            const existing = await this.findByUsername(updateUserDto.username);
            if (existing && existing.id !== id) {
                throw new common_1.BadRequestException('Username already exists');
            }
        }
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }
    async findUserByToken(tokenOTP) {
        const user = await this.userRepository.findOne({ where: { tokenOTP } });
        if (!user) {
            throw new common_1.NotFoundException('User not found with the provided token');
        }
        return user;
    }
    async updateUser(user) {
        const existingUser = await this.userRepository.findOne({ where: { id: user.id } });
        if (!existingUser) {
            throw new common_1.NotFoundException('User not found');
        }
        existingUser.isVerified = user.isVerified;
        existingUser.tokenOTP = user.tokenOTP;
        return await this.userRepository.save(existingUser);
    }
    async assignRole(userId, role) {
        const user = await this.findOne(userId);
        user.role = [role];
        const updatedUser = await this.userRepository.save(user);
        const { password, tokenOTP, otpExpiry } = updatedUser, userResponse = __rest(updatedUser, ["password", "tokenOTP", "otpExpiry"]);
        return {
            message: 'Role đã được cập nhật thành công',
            user: userResponse,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(User_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=User.service.js.map