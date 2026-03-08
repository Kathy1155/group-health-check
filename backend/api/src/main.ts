import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // 開發期先這樣，之後可改成只允許前端網址
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();