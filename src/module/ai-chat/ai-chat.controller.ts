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
  ParseUUIDPipe,
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
import { CreateConversationDto } from './dto/create-conversation.dto';

@ApiTags('AI Chat')
@ApiBearerAuth('JWT-auth')
@Controller('ai-chat')
@UseGuards(JwtAuthGuard)
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create new conversation (like "+ Trò chuyện mới" button)' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully' })
  async createConversation(@Request() req, @Body() dto: CreateConversationDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    const result = await this.aiChatService.createConversation(userId, dto);

    return {
      data: result,
      statusCode: 201,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations (for sidebar list)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns paginated conversations' })
  async getConversations(@Request() req, @Query() pagination: PaginationDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    const result = await this.aiChatService.getConversations(userId, pagination);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Get all messages in a conversation' })
  @ApiParam({ name: 'conversationId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns conversation messages' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversationMessages(
    @Request() req,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query() pagination: PaginationDto,
  ) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    const result = await this.aiChatService.getConversationMessages(userId, conversationId, pagination);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('conversations/:conversationId')
  @ApiOperation({ summary: 'Delete conversation and all its messages' })
  @ApiParam({ name: 'conversationId', type: String })
  @ApiResponse({ status: 200, description: 'Conversation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async deleteConversation(
    @Request() req,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    
    const result = await this.aiChatService.deleteConversation(userId, conversationId);

    return {
      data: result,
      statusCode: 200,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('save-history')
  @ApiOperation({ summary: 'Save AI chat history with conversation support' })
  @ApiResponse({ status: 201, description: 'History saved successfully. Returns conversationId for next messages.' })
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
