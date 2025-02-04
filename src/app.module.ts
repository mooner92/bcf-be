import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 모든 모듈에서 환경변수 사용
    }),
    DatabaseModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
