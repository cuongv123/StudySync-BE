import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { RolesGuard } from '../auth/guards/RolesGuard';
import { Roles } from '../../decorator/roles.decorator';
import { Public } from '../../decorator/public.decorator';
import { Role } from '../../common/enums/role.enum';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AdminReplyDto } from './dto/admin-reply.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';

@ApiTags('Reviews')
@ApiBearerAuth('JWT-auth')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ============ USER ENDPOINTS (Auth Required) ============

  @Get()
  @ApiOperation({ summary: 'Get all public reviews' })
  @ApiResponse({ status: 200, description: 'Returns public reviews with stats' })
  async getPublicReviews(@Query() filter: ReviewFilterDto) {
    const result = await this.reviewService.getPublicReviews(filter);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get review statistics' })
  @ApiResponse({ status: 200, description: 'Returns review stats' })
  async getReviewStats() {
    const result = await this.reviewService.getReviewStats();

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single review by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Returns review detail' })
  async getReviewById(@Param('id') id: string) {
    const result = await this.reviewService.getReviewById(id);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create review (User - 1 review per user)' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 409, description: 'User already has a review' })
  async createReview(@Request() req, @Body() dto: CreateReviewDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    const result = await this.reviewService.createReview(userId, dto);

    return {
      data: result,
      statusCode: 201,
      message: 'Review created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('my-review/detail')
  @ApiOperation({ summary: 'Get my review (User)' })
  @ApiResponse({ status: 200, description: 'Returns user review' })
  @ApiResponse({ status: 404, description: 'No review found' })
  async getMyReview(@Request() req) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    const result = await this.reviewService.getMyReview(userId);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('my-review')
  @ApiOperation({ summary: 'Update my review (User)' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  async updateMyReview(@Request() req, @Body() dto: UpdateReviewDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    const result = await this.reviewService.updateMyReview(userId, dto);

    return {
      data: result,
      statusCode: 200,
      message: 'Review updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('my-review')
  @ApiOperation({ summary: 'Delete my review (User)' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async deleteMyReview(@Request() req) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    const result = await this.reviewService.deleteMyReview(userId);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  // ============ ADMIN ENDPOINTS ============

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all reviews (Admin - including hidden)' })
  @ApiResponse({ status: 200, description: 'Returns all reviews' })
  async getAllReviews(@Query() filter: ReviewFilterDto) {
    const result = await this.reviewService.getAllReviews(filter);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('admin/:id/reply')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin reply to review' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Reply added successfully' })
  async adminReplyReview(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AdminReplyDto,
  ) {
    const adminId = req.user?.id || req.user?.userId || req.user?.sub;
    const result = await this.reviewService.adminReplyReview(adminId, id, dto);

    return {
      data: result,
      statusCode: 200,
      message: 'Reply added successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin update review (any field)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  async adminUpdateReview(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    const result = await this.reviewService.adminUpdateReview(id, dto);

    return {
      data: result,
      statusCode: 200,
      message: 'Review updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('admin/:id/visibility')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin toggle review visibility (hide/show)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Visibility updated' })
  async toggleVisibility(
    @Param('id') id: string,
    @Body('isPublic') isPublic: boolean,
  ) {
    const result = await this.reviewService.toggleVisibility(id, isPublic);

    return {
      data: result,
      statusCode: 200,
      message: 'Visibility updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('admin/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Admin delete any review' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  async adminDeleteReview(@Param('id') id: string) {
    const result = await this.reviewService.adminDeleteReview(id);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('admin/dashboard/stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  @ApiResponse({ status: 200, description: 'Returns admin statistics' })
  async getAdminStats() {
    const result = await this.reviewService.getAdminStats();

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }
}
