import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  app.enableCors({
    origin: '*', // 개발용 CORS 설정 (배포 시에는 수정 필요)
  });

  await app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
//
bootstrap();
//