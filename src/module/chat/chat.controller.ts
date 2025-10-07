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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('groups/:groupId/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('messages')
  @ApiOperation({ summary: 'Gửi tin nhắn (REST API fallback)' })
  @ApiResponse({ status: 201, description: 'Tin nhắn đã được gửi' })
  @ApiResponse({ status: 403, description: 'Không có quyền gửi tin nhắn' })
  async sendMessage(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const userId = req.user.id;
    const message = await this.chatService.sendMessage(
      userId,
      groupId,
      createMessageDto,
    );

    return {
      success: true,
      message: 'Tin nhắn đã được gửi',
      data: message,
    };
  }

  @Get('messages')
  @ApiOperation({ summary: 'Lấy lịch sử tin nhắn của nhóm' })
  @ApiResponse({ status: 200, description: 'Danh sách tin nhắn' })
  async getMessages(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query() getMessagesDto: GetMessagesDto,
  ) {
    const userId = req.user.id;
    const result = await this.chatService.getMessages(
      userId,
      groupId,
      getMessagesDto,
    );

    return {
      success: true,
      message: 'Lấy danh sách tin nhắn thành công',
      data: result,
    };
  }

  @Get('messages/:messageId')
  @ApiOperation({ summary: 'Lấy chi tiết một tin nhắn' })
  @ApiResponse({ status: 200, description: 'Chi tiết tin nhắn' })
  @ApiResponse({ status: 404, description: 'Tin nhắn không tồn tại' })
  async getMessageById(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    const userId = req.user.id;
    const message = await this.chatService.getMessageById(
      userId,
      groupId,
      messageId,
    );

    return {
      success: true,
      message: 'Lấy chi tiết tin nhắn thành công',
      data: message,
    };
  }

  @Put('messages/:messageId')
  @ApiOperation({ summary: 'Sửa tin nhắn' })
  @ApiResponse({ status: 200, description: 'Tin nhắn đã được cập nhật' })
  @ApiResponse({ status: 403, description: 'Không có quyền sửa tin nhắn' })
  async updateMessage(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    const userId = req.user.id;
    const message = await this.chatService.updateMessage(
      userId,
      groupId,
      messageId,
      updateMessageDto,
    );

    return {
      success: true,
      message: 'Tin nhắn đã được cập nhật',
      data: message,
    };
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Xóa tin nhắn' })
  @ApiResponse({ status: 200, description: 'Tin nhắn đã được xóa' })
  @ApiResponse({ status: 403, description: 'Không có quyền xóa tin nhắn' })
  async deleteMessage(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
    @Param('messageId', ParseIntPipe) messageId: number,
  ) {
    const userId = req.user.id;
    await this.chatService.deleteMessage(userId, groupId, messageId);

    return {
      success: true,
      message: 'Tin nhắn đã được xóa',
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Đếm số tin nhắn chưa đọc' })
  @ApiResponse({ status: 200, description: 'Số tin nhắn chưa đọc' })
  async getUnreadCount(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    const userId = req.user.id;
    const count = await this.chatService.getUnreadCount(userId, groupId);

    return {
      success: true,
      message: 'Lấy số tin nhắn chưa đọc thành công',
      data: { count },
    };
  }
}
