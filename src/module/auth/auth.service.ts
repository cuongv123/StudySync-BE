import { Injectable,BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../User/User.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from 'src/common/enums/role.enum';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(RegisterDto:  RegisterDto ){
    const exiting = await this.usersService.findByEmail(RegisterDto.email);
    if(exiting) {
      throw new BadRequestException('Email already exists');
    }

    const hasdedpassword = await bcrypt.hash(RegisterDto.password, 10);

    const NewUser = await this.usersService.create({
      email: RegisterDto.email,
      password: hasdedpassword,
      username: RegisterDto.username,
      role: [ Role.USER],
    });
    return {message: 'Register success', userid: NewUser.id};
  }

  async validateUser(email: string, password: string){
    const user = await this.usersService.findByEmail(email);
    if(!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: pwd, ...result } = user;
    return result;
  }
  

  async login(loginDto: LoginDto){
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const payload = { sub: user.id, email: user.email, role: user.role};
  
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
