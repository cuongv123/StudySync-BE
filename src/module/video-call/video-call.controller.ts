import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { VideoCallService } from './video-call.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { StartCallDto } from './dto/start-call.dto';
import { JoinCallDto } from './dto/join-call.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Video Calls')
@ApiBearerAuth('JWT-auth')
@Controller('video-calls')
@UseGuards(JwtAuthGuard)
export class VideoCallController {
  constructor(private readonly videoCallService: VideoCallService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new video call in a group' })
  @ApiResponse({ status: 201, description: 'Call started successfully' })
  @ApiResponse({ status: 400, description: 'Call already ongoing in group' })
  @ApiResponse({ status: 403, description: 'Not a member of the group' })
  async startCall(@Request() req, @Body() startCallDto: StartCallDto) {
    return this.videoCallService.startCall(startCallDto, req.user.id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an ongoing video call' })
  @ApiResponse({ status: 200, description: 'Joined call successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  @ApiResponse({ status: 400, description: 'Call is not active' })
  async joinCall(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() joinCallDto: JoinCallDto,
  ) {
    return this.videoCallService.joinCall(joinCallDto, req.user.id);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave a video call' })
  @ApiResponse({ status: 200, description: 'Left call successfully' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  @ApiResponse({ status: 403, description: 'You are not a participant in this call' })
  async leaveCall(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.videoCallService.leaveCall(id, req.user.id);
    return { message: 'Left call successfully' };
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End a video call (host only)' })
  @ApiResponse({ status: 200, description: 'Call ended successfully' })
  @ApiResponse({ status: 403, description: 'Only the host can end the call' })
  async endCall(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.videoCallService.endCall(id, req.user.id);
    return { message: 'Call ended successfully' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get call details' })
  @ApiResponse({ status: 200, description: 'Call details retrieved' })
  @ApiResponse({ status: 404, description: 'Call not found' })
  async getCallDetails(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.videoCallService.getCallDetails(id, req.user.id);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Get active participants in a call' })
  @ApiResponse({ status: 200, description: 'Participants retrieved' })
  async getParticipants(@Param('id', ParseIntPipe) id: number) {
    return this.videoCallService.getCallParticipants(id);
  }

  @Get('group/:groupId/active')
  @ApiOperation({ summary: 'Get active calls for a group' })
  @ApiResponse({ status: 200, description: 'Active calls retrieved' })
  async getGroupActiveCalls(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.videoCallService.getGroupActiveCalls(groupId, req.user.id);
  }

  @Get('group/:groupId/history')
  @ApiOperation({ summary: 'Get call history for a group' })
  @ApiResponse({ status: 200, description: 'Call history retrieved' })
  async getCallHistory(
    @Request() req,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.videoCallService.getCallHistory(groupId, req.user.id);
  }
}
