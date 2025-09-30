import { IsOptional, IsArray, IsString } from 'class-validator'; // Thêm nếu cần validation

export class SaveTokenDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  refeshtokenused?: string[];

  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}
