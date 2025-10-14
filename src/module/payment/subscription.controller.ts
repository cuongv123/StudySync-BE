import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { SubscriptionService } from '../payment/services/subscription.service';
import { UpgradeSubscriptionDto, PaginationDto } from '../payment/dto/subscription.dto';

@ApiTags('Subscriptions')
@ApiBearerAuth('JWT-auth')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

  // Expose walletService via getter
  private getWalletService() {
    // @ts-ignore
    return this.subscriptionService.walletService;
  }

  // ===== SUBSCRIPTION PLANS =====

  @Get('plans')
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiResponse({ status: 200, description: 'Returns all available subscription plans' })
  async getPlans() {
    return {
      data: await this.subscriptionService.getAllPlans(),
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  // ===== USER SUBSCRIPTION MANAGEMENT =====

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({ status: 200, description: 'Returns current subscription details' })
  async getCurrentSubscription(@Request() req) {
    return {
      data: await this.subscriptionService.getUserSubscription(req.user.sub),
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get subscription statistics' })
  @ApiResponse({ status: 200, description: 'Returns subscription usage statistics' })
  async getSubscriptionStats() {
    return {
      data: await this.subscriptionService.getSubscriptionStats(),
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upgrade subscription plan' })
  @ApiResponse({ status: 200, description: 'Subscription upgraded successfully' })
  async upgradeSubscription(
    @Body() upgradeSubscriptionDto: UpgradeSubscriptionDto,
    @Request() req
  ) {
    try {
      const subscription = await this.subscriptionService.upgradeWithWallet(
        req.user.id,
        upgradeSubscriptionDto.planId
      );
      const wallet = await this.getWalletService().getOrCreateWallet(req.user.id);
      return {
        data: {
          newPlan: subscription.plan,
          balance: wallet.balance,
        },
        statusCode: 200,
        message: 'Subscription upgraded successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const err = error as any;
      if (err instanceof BadRequestException && err.message === 'Insufficient wallet balance') {
        return {
          statusCode: 400,
          message: 'Insufficient wallet balance',
          timestamp: new Date().toISOString(),
        };
      }
      throw error;
    }
  }
}