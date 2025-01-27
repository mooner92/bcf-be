// chat.gateway.ts
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
    cors: {
      origin: '*', // 필요시 도메인 지정
    },
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
      console.log('Client connected:', client.id);
    }
  
    handleDisconnect(client: Socket) {
      console.log('Client disconnected:', client.id);
    }
  
    @SubscribeMessage('join_room')
    async onJoinRoom(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { roomId: string },
    ) {
      client.join(data.roomId);
      console.log(`Client ${client.id} joined room ${data.roomId}`);
      // 이전 메시지 불러오기 -> 클라이언트로 전송
      const messages = await this.chatService.getMessages(data.roomId);
      client.emit('previous_messages', messages);
    }
  
    @SubscribeMessage('typing')
    onTyping(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: { roomId: string; isTyping: boolean },
    ) {
      // 같은 방 사람들에게 "누군가 입력 중" 이벤트 전송
      client.to(data.roomId).emit('someone_typing', { userId: client.id, ...data });
    }
  
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
      // 같은 방 사용자들에게 새로운 메시지 전달
      this.server.to(data.roomId).emit('receive_message', newMessage);
    }
  }
  