import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JoinGroupRequestDto } from './dto/member-actions.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';
import { TransferLeadershipDto } from './dto/transfer-leadership.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@ApiTags('Study Groups')
@ApiBearerAuth('JWT-auth')
@Controller("groups")
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo nhóm học mới' })
  create(@Body() createDto: CreateGroupDto, @Request() req: any) {
    return this.groupService.createGroup(createDto, req.user.id);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách tất cả các nhóm trong hệ thống' })
  getAllGroups(@Request() req: any) {
    return this.groupService.getAllGroups(req.user.id);
  }

  @Get('my-groups')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách nhóm của tôi' })
  getMyGroups(@Request() req: any) {
    return this.groupService.getMyGroups(req.user.id);
  }

  @Get('invitations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xem lời mời đã nhận' })
  async getReceivedInvitations(@Request() req: any) {
    return this.groupService.getGroupInvitations(req.user.id, 'received');
  }

  @Get('invitations/sent')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xem lời mời đã gửi' })
  async getSentInvitations(@Request() req: any) {
    return this.groupService.getGroupInvitations(req.user.id, 'sent');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy chi tiết nhóm (chỉ nhóm đã join)' })
  getGroupDetail(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.groupService.getGroupDetail(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin nhóm (Leader only)' })
  updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateGroupDto,
    @Request() req: any
  ) {
    return this.groupService.updateGroup(id, updateDto, req.user.id);
  }

  @Post(':id/invite')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mời thành viên vào nhóm' })
  async inviteMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Body() inviteDto: InviteMemberDto,
    @Request() req: any
  ) {
    return this.groupService.inviteMember(
      groupId,
      req.user.id,
      inviteDto.memberEmail,
      inviteDto.message
    );
  }

  @Post(':id/join-request')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xin gia nhập nhóm' })
  async requestJoinGroup(
    @Param('id', ParseIntPipe) groupId: number,
    @Body() joinDto: JoinGroupRequestDto,
    @Request() req: any
  ) {
    return this.groupService.requestJoinGroup(
      groupId,
      req.user.id,
      joinDto.message
    );
  }

  @Get(':id/join-requests')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xem danh sách yêu cầu gia nhập nhóm (Leader only)' })
  async getJoinRequests(
    @Param('id', ParseIntPipe) groupId: number,
    @Request() req: any
  ) {
    return this.groupService.getJoinRequests(groupId, req.user.id);
  }

  @Post('join-requests/:requestId/approve')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Duyệt yêu cầu gia nhập nhóm (Leader only)' })
  async approveJoinRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Request() req: any
  ) {
    return this.groupService.approveJoinRequest(requestId, req.user.id);
  }

  @Post('join-requests/:requestId/deny')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Từ chối yêu cầu gia nhập nhóm (Leader only)' })
  async denyJoinRequest(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Request() req: any
  ) {
    return this.groupService.denyJoinRequest(requestId, req.user.id);
  }

  @Post('invitations/:invitationId/respond')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Phản hồi lời mời' })
  async respondToInvitation(
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @Body() responseDto: RespondInvitationDto,
    @Request() req: any
  ) {
    return this.groupService.respondToInvitation(
      invitationId,
      req.user.id,
      responseDto.status
    );
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách thành viên nhóm' })
  async getGroupMembers(
    @Param('id', ParseIntPipe) groupId: number,
    @Request() req: any
  ) {
    return this.groupService.getGroupMembers(groupId, req.user.id);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Đuổi thành viên khỏi nhóm (Leader only)' })
  async removeMember(
    @Param('id', ParseIntPipe) groupId: number,
    @Param('userId') userId: string,
    @Request() req: any
  ) {
    return this.groupService.removeMember(groupId,req.user.id,userId);
  }

  @Post(':id/transfer-leadership')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Chuyển giao quyền leader cho thành viên khác (Leader only)' })
  async transferLeadership(
    @Param('id', ParseIntPipe) groupId: number,
    @Body() transferDto: TransferLeadershipDto,
    @Request() req: any
  ) {
    return this.groupService.transferLeadership(groupId, req.user.id, transferDto.newLeaderId);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Rời khỏi nhóm' })
  async leaveGroup(
    @Param('id', ParseIntPipe) groupId: number,
    @Request() req: any
  ) {
    return this.groupService.leaveGroup(groupId, req.user.id);
  }
}
