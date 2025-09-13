import { MinLength } from 'class-validator';

export class ResetPasswordDto {
  message: string;

  @MinLength(6)
  newPassword: string;
}