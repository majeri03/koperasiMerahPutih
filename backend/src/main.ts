import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mengaktifkan validasi DTO secara global
  app.useGlobalPipes(new ValidationPipe());

  // Konfigurasi Swagger
  const config = new DocumentBuilder()
    .setTitle('API Koperasi Merah Putih')
    .setDescription('Dokumentasi API untuk Sistem Koperasi Merah Putih')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Path untuk mengakses UI Swagger, e.g., http://localhost:3000/api
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
void bootstrap();
