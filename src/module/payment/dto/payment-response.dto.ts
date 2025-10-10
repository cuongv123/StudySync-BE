import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment URL for gateway' })
  paymentUrl: string;

  @ApiProperty({ description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ description: 'Payment amount' })
  amount: number;

  @ApiProperty({ description: 'Gateway name' })
  gateway: string;

  @ApiProperty({ description: 'Expiry time' })
  expiresAt: Date;
}

export class WalletBalanceDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Current balance' })
  balance: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Last updated' })
  updatedAt: Date;
}

export class TransactionHistoryDto {
  @ApiProperty({ description: 'Transaction list' })
  transactions: any[];

  @ApiProperty({ description: 'Total records' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Records per page' })
  limit: number;
}