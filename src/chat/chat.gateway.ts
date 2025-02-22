// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' }, // 개발 시 편의상 허용
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private server: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.server = server;
    console.log('Chat Gateway Initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // 방 참여 이벤트
  @SubscribeMessage('join_room')
  async onJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string },
  ) {
    // 실제론 userId를 소켓 인증(JWT)에서 가져오는 게 일반적
    // 여기서는 단순히 클라이언트에서 보내는 데이터 사용
    console.log(`Client ${client.id} joined room ${data.roomId}`);
    client.join(data.roomId);

    // 이전 메시지 보내기
    const messages = await this.chatService.getRoomMessages(
      data.roomId,
      data.userId,
    );
    client.emit('previous_messages', messages);
  }

  // 메시지 전송 이벤트
  @SubscribeMessage('send_message')
  async onSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; senderId: string; content: string },
  ) {
    // DB 저장
    const newMessage = await this.chatService.saveMessage(
      data.roomId,
      data.senderId,
      data.content,
    );
    // 같은 방에 있는 모든 클라이언트에 메시지 전송
    this.server.to(data.roomId).emit('receive_message', newMessage);
  }
}

// import {
//   WebSocketGateway,
//   SubscribeMessage,
//   MessageBody,
//   ConnectedSocket,
//   OnGatewayInit,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Socket, Server } from 'socket.io';
// import { ChatService } from './chat.service';

// @WebSocketGateway({
//   cors: {
//     origin: '*', // 개발 환경에서는 모든 도메인 허용 (배포 시에는 도메인 제한 권장)
//   },
// })
// export class ChatGateway
//   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
// {
//   private server: Server;

//   constructor(private readonly chatService: ChatService) {}

//   afterInit(server: Server) {
//     this.server = server;
//     console.log('Chat Gateway Initialized');
//   }

//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//   }

//   // 채팅방 참여 이벤트
//   @SubscribeMessage('join_room')
//   async handleJoinRoom(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: { roomId: string }
//   ) {
//     client.join(data.roomId);
//     console.log(`Client ${client.id} joined room ${data.roomId}`);

//     // 해당 채팅방의 이전 메시지 불러오기
//     const messages = await this.chatService.getMessages(data.roomId);
//     client.emit('previous_messages', messages);
//   }

//   // 메시지 송신 이벤트
//   @SubscribeMessage('send_message')
//   async handleSendMessage(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: { roomId: string; senderId: string; content: string }
//   ) {
//     // Chats 테이블에 메시지 저장
//     const newMessage = await this.chatService.saveMessage(
//       data.roomId,
//       data.senderId,
//       data.content,
//     );
//     // 같은 채팅방의 모든 클라이언트에게 새 메시지 브로드캐스트
//     this.server.to(data.roomId).emit('receive_message', newMessage);
//   }
// }
