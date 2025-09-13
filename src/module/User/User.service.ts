// src/modules/user/user.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from './dto/update-password';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * [ADMIN] Lấy toàn bộ user
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * [ADMIN] Lấy user theo id
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * [USER] Đổi mật khẩu của chính mình
   */
  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const user = await this.findOne(userId);

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    // Hash mật khẩu mới
    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password successfully updated' };
  }

  /**
   * [ADMIN] Reset mật khẩu của user bất kỳ
   */
  async resetPassword(userId: string) {
    const user = await this.findOne(userId);

    const newPassword = '123456'; // 👈 hoặc generate random
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return {
      message: 'Password reset successfully',
      resetPassword: newPassword,
    };
  }

  /**
   * [ADMIN] Xóa user
   */
  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: 'User deleted successfully' };
  }
   async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }
}
