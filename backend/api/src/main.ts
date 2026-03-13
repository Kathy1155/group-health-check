import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 統一在路徑前加上 /api
  app.setGlobalPrefix('api');

  // 開放給前端 dev server 呼叫
  app.enableCors({
<<<<<<< Updated upstream
    origin: true, // 開發期先這樣，之後可改成只允許前端網址
=======
    origin: ['http://localhost:5173'],
>>>>>>> Stashed changes
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();