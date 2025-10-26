import { IsNumber, IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseSubscriptionDto {
  @ApiProperty({ 
    description: 'Subscription plan ID',
    example: 1
  })
  @IsNumber()
  planId: number;

  @ApiProperty({ 
    description: 'Buyer name',
    example: 'Nguyen Van A',
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ 
    description: 'Buyer email',
    example: 'user@example.com',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    description: 'Buyer phone',
    example: '0912345678',
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
