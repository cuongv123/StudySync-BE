import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { AiChatService } from './ai-chat.service';
import { SaveHistoryDto } from './dto/save-history.dto';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('AI Chat')
@ApiBearerAuth('JWT-auth')
@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('save-history')
  @ApiOperation({ summary: 'Save AI chat history (called from frontend after Gemini response)' })
  @ApiResponse({ status: 201, description: 'History saved successfully' })
  @ApiResponse({ status: 400, description: 'Limit reached or validation error' })
  async saveHistory(@Request() req, @Body() dto: SaveHistoryDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    const result = await this.aiChatService.saveHistory(userId, dto);

    return {
      data: result,
      statusCode: 201,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get AI chat history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns paginated history' })
  async getHistory(@Request() req, @Query() pagination: PaginationDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    const result = await this.aiChatService.getHistory(userId, pagination);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('history/:id')
  @ApiOperation({ summary: 'Get AI chat history by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Returns history detail' })
  @ApiResponse({ status: 404, description: 'History not found' })
  async getHistoryById(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    const result = await this.aiChatService.getHistoryById(userId, id);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('history/:id')
  @ApiOperation({ summary: 'Delete AI chat history by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'History deleted successfully' })
  @ApiResponse({ status: 404, description: 'History not found' })
  async deleteHistory(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    const result = await this.aiChatService.deleteHistory(userId, id);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('history/clear/all')
  @ApiOperation({ summary: 'Clear all AI chat history' })
  @ApiResponse({ status: 200, description: 'All history cleared successfully' })
  async clearHistory(@Request() req) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    const result = await this.aiChatService.clearHistory(userId);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get AI usage statistics' })
  @ApiResponse({ status: 200, description: 'Returns usage info' })
  async getUsage(@Request() req) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    const result = await this.aiChatService.getUsage(userId);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }
}
