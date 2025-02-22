// src/chat/chat.controller.ts
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
// 예: JWT 인증 Guard가 있다면 import
// import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // 유저별 채팅방 목록 조회
  // 실제론 로그인된 userId를 Guard나 토큰에서 가져와야 함
  @Get('rooms')
  // @UseGuards(JwtAuthGuard)  // 실제 JWT 인증 시
  async getUserRooms(@Query('userId') userId: string) {
    // 예: ?userId=abc 식으로 받는 상황
    return this.chatService.getUserRooms(userId);
  }

  // 특정 채팅방의 메시지 목록
  @Get('rooms/:roomId/messages')
  // @UseGuards(JwtAuthGuard)
  async getRoomMessages(
    @Param('roomId') roomId: string,
    @Query('userId') userId: string, // 실제론 auth에서 가져옴
  ) {
    // 여기서 userId가 해당 room에 참여 중인지 검사하고 메시지 반환
    return this.chatService.getRoomMessages(roomId, userId);
  }
}