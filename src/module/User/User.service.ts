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
import * as crypto from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
 
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Email already exists');
      }
      user.email = dto.email;
    }
    if (dto.username) {
      const existing = await this.findByUsername(dto.username);
      if (existing && existing.id !== userId) {
        throw new BadRequestException('Username already exists');
      }
      user.username = dto.username;
    }

    return this.userRepository.save(user);
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

 async resetPassword(
  userId: string,
  newPassword: string, 
): Promise<{ message: string }> {
  const user = await this.findOne(userId);
  user.password = await bcrypt.hash(newPassword, 10);
  await this.userRepository.save(user);
  return { message: 'Password reset successfully' };
}

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

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.findByEmail(createUserDto.email);
    if (existing) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }

async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
  const user = await this.findOne(id);
  
  if (updateUserDto.email) {
    const existing = await this.findByEmail(updateUserDto.email);
    if (existing && existing.id !== id) {
      throw new BadRequestException('Email already exists');
    }
  }
  
  if (updateUserDto.username) {
    const existing = await this.findByUsername(updateUserDto.username);
    if (existing && existing.id !== id) {
      throw new BadRequestException('Username already exists');
    }
  }
  
  Object.assign(user, updateUserDto);
  return this.userRepository.save(user);
  }
  async findUserByToken(tokenOTP: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { tokenOTP } });

    if (!user) {
      throw new NotFoundException('User not found with the provided token');
    }
    return user;
  }
   async updateUser(user: User): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { id: user.id } });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    existingUser.isVerified = user.isVerified;
    existingUser.tokenOTP = user.tokenOTP;

    return await this.userRepository.save(existingUser);
  }

}