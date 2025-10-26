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
import { SubscriptionService } from './subscription.service';
import { PurchaseSubscriptionDto, UpgradeSubscriptionDto, PaginationDto } from './dto/subscription.dto';

@ApiTags('Subscriptions')
@ApiBearerAuth('JWT-auth')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) {}

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
    // Fix: Use req.user.id instead of req.user.sub
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return {
      data: await this.subscriptionService.getUserSubscription(userId),
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }
}