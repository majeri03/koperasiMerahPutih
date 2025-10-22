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
    .addTag('Tenants')
    .addTag('Webhooks')
    .addTag('Authentication')
    .addTag('Public')
    .addTag('Members (Buku 01)')
    .addTag('Board Positions (Buku 02)')
    .addTag('Supervisory Positions (Buku 03)')
    .addTag('Simpanan Anggota (Buku 04)')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Path untuk mengakses UI Swagger, e.g., http://localhost:3000/api
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
void bootstrap();
