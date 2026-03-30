import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // 只允許 DTO 裡有的欄位
    transform: true, // 自動轉型（搭配 @Type）
  }),
);

  // 統一在路徑前加上 /api
  app.setGlobalPrefix('api');

  // 開放給前端 dev server 呼叫
  app.enableCors({
    // 保留你原本設定的網址，這對前端連線比較準確
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    
    credentials: true,
  });

  // 使用環境變數或預設 3000 埠
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 後端啟動成功！`);
  console.log(`🔗 API 位址：http://localhost:${port}/api`);
}
bootstrap();