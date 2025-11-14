import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { GroupEventService } from './services/group-event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { GetUser } from '../../decorator/getuser.decorator';

@ApiTags('Group Events')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('events')
export class GroupEventController {
  constructor(private readonly groupEventService: GroupEventService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo sự kiện mới',
    description:
      'Tạo sự kiện mới trong nhóm học. Notification sẽ gửi đến TẤT CẢ members. ParticipatIds là danh sách members CẦN THAM GIA (được note).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo sự kiện thành công. Trả về event với danh sách participants.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy nhóm',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không phải thành viên của nhóm',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ',
  })
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @GetUser('id') userId: string,
  ) {
    const event = await this.groupEventService.createEvent(
      createEventDto,
      userId,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Tạo sự kiện thành công',
      data: event,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách sự kiện',
    description:
      'Lấy danh sách sự kiện của các nhóm mà user tham gia. Hỗ trợ filter theo groupId, eventType, startDate, endDate.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy danh sách sự kiện thành công. Mỗi event có list participants.',
  })
  async getEvents(
    @Query() filterDto: FilterEventDto,
    @GetUser('id') userId: string,
  ) {
    const events = await this.groupEventService.getEvents(filterDto, userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách sự kiện thành công',
      data: events,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết sự kiện',
    description:
      'Lấy thông tin chi tiết của một sự kiện bao gồm danh sách participants. Chỉ members của nhóm mới xem được.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của sự kiện',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lấy chi tiết sự kiện thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sự kiện',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xem sự kiện này',
  })
  async getEventById(
    @Param('id') eventId: string,
    @GetUser('id') userId: string,
  ) {
    const event = await this.groupEventService.getEventById(eventId, userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy chi tiết sự kiện thành công',
      data: event,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật sự kiện',
    description:
      'Cập nhật thông tin sự kiện. Chỉ creator hoặc leader của nhóm mới được cập nhật. Notification gửi đến TẤT CẢ members.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của sự kiện',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật sự kiện thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sự kiện',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền cập nhật sự kiện này',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu không hợp lệ',
  })
  async updateEvent(
    @Param('id') eventId: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser('id') userId: string,
  ) {
    const event = await this.groupEventService.updateEvent(
      eventId,
      updateEventDto,
      userId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật sự kiện thành công',
      data: event,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa sự kiện',
    description:
      'Xóa sự kiện khỏi lịch. Chỉ creator hoặc leader của nhóm mới được xóa. Notification gửi đến TẤT CẢ members.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của sự kiện',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa sự kiện thành công',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy sự kiện',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền xóa sự kiện này',
  })
  async deleteEvent(
    @Param('id') eventId: string,
    @GetUser('id') userId: string,
  ) {
    await this.groupEventService.deleteEvent(eventId, userId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Xóa sự kiện thành công',
    };
  }
}
