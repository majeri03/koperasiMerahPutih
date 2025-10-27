// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- TAMBAHKAN KEMBALI KONFIGURASI CORS DI SINI ---
  app.enableCors({
    origin: 'http://gokiljaya.localhost:3000', // Pastikan origin frontend benar
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  // ---------------------------------------------

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: 'http://gokiljaya.localhost:3000', // Pastikan origin frontend benar
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
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
    .addTag('App')
    .addTag('Users')
    .addTag('Cooperative Profile (Tenant)')
    .addTag('Members (Buku 01)')
    .addTag('Board Positions (Buku 02)')
    .addTag('Supervisory Positions (Buku 03)')
    .addTag('Simpanan Anggota (Buku 04)')
    .addTag('Loans (Buku 05)')
    .addTag('Inventory (Buku 06)')
    .addTag('Member Meeting Notes (Buku 07)')
    .addTag('Board Meeting Notes (Buku 08)')
    .addTag('Supervisory Meeting Notes (Buku 09)')
    .addTag('Employees (Buku 10)')
    .addTag('Guest Book (Buku 11)')
    .addTag('Member Suggestions (Buku 12)')
    .addTag('Supervisory Suggestions (Buku 13)')
    .addTag('Official Recommendations (Buku 14)')
    .addTag('Important Events (Buku 15)')
    .addTag('Articles (Berita & Artikel)')
    .addTag('Product Categories')
    .addTag('Products (Katalog)')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3002);
}
void bootstrap();
