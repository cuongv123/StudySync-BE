import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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