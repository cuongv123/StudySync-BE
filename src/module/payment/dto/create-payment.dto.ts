import { IsNumber, IsEnum, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod,  } from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ 
    description: 'Payment amount in VND',
    minimum: 2000,
    maximum: 50000000,
    example: 50000
  })
  @IsNumber()
  @Min(2000, { message: 'Minimum amount is 2,000 VND' })
  @Max(50000000, { message: 'Maximum amount is 50,000,000 VND' })
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.SEPAY
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment description',
    example: 'Nạp tiền vào ví StudySync',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
}