// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- TAMBAHKAN KEMBALI KONFIGURASI CORS DI SINI ---
  app.enableCors({
    origin: 'http://majujaya.localhost:3000', // Pastikan origin frontend benar
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  // ---------------------------------------------

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('API Koperasi Merah Putih')
    // ... (konfigurasi Swagger lainnya) ...
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Pastikan port sudah diubah ke 3002
  await app.listen(3002);
  console.log(`Backend application is running on: ${await app.getUrl()}`); // Tambahkan log ini jika belum ada
}
void bootstrap();