import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './User.entity';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordDto } from './dto/update-password';
import * as crypto from 'crypto'; // Thêm để generate random password nếu cần

@Injectable()
export class UsersService {
  findByUsername(username: string) {
    throw new Error('Method not implemented.');
  }
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
  async updatePassword(
    userId: string,
    dto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
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
  async resetPassword(
    userId: string,
    newPassword?: string,
  ): Promise<{ message: string }> {
    const user = await this.findOne(userId);

    // Nếu không cung cấp newPassword, generate random (8 ký tự)
    const resetPass = newPassword || crypto.randomBytes(4).toString('hex');
    user.password = await bcrypt.hash(resetPass, 10);
    await this.userRepository.save(user);

    return {
      message: 'Password reset successfully',
    }; // Không return resetPass ở production để tránh lộ; gửi email thay thế
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