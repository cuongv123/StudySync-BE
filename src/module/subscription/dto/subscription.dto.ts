import { IsNumber, IsOptional, Min, Max, IsString, IsEmail } from 'class-validator';
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

export class UpgradeSubscriptionDto {
  @ApiProperty({ 
    description: 'Target subscription plan ID',
    example: 2
  })
  @IsNumber()
  planId: number;
}

export class PaginationDto {
  @ApiProperty({ 
    description: 'Page number',
    default: 1,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ 
    description: 'Records per page',
    default: 10,
    minimum: 1,
    maximum: 100
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;
}