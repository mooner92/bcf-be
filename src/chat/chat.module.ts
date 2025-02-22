// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { DatabaseModule } from '../database/database.module';
import { ChatController } from './chat.controller';

@Module({
  imports: [DatabaseModule],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}

// import { Module } from '@nestjs/common';
// import { ChatGateway } from './chat.gateway';
// import { ChatService } from './chat.service';
// import { DatabaseModule } from '../database/database.module';

// @Module({
//   imports: [DatabaseModule],
//   providers: [ChatGateway, ChatService],
// })
// export class ChatModule {}

