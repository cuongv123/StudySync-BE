import { Role } from 'src/common/enums/role.enum';
export declare class CreateUserDto {
    email: string;
    password: string;
    username: string;
    role: Role[];
}
