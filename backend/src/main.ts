// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // <-- 1. Import ConfigService
import { PrismaClient, TenantStatus } from '@prisma/client';
async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const frontendDomain = configService.get<string>(
    'FRONTEND_DOMAIN',
    'localhost:3000',
  );
  const protocol = frontendDomain.startsWith('localhost') ? 'http' : 'https';

  const allowedOrigins = [`${protocol}://${frontendDomain}`];

  const prismaPublic = new PrismaClient();

  try {
    console.log('[Bootstrap] Fetching active tenants for CORS whitelist...');
    const activeTenants = await prismaPublic.tenant.findMany({
      where: { status: TenantStatus.ACTIVE },
      select: { subdomain: true },
    });

    const tenantOrigins = activeTenants.map(
      (tenant) => `${protocol}://${tenant.subdomain}.${frontendDomain}`,
    );

    allowedOrigins.push(...tenantOrigins);

    console.log('[Bootstrap] CORS Whitelist successfully built:');
    console.log(allowedOrigins);
  } catch (error) {
    console.error(
      '[Bootstrap] CRITICAL: Failed to fetch tenants for CORS. Server might not accept tenant connections.',
      error,
    );
  } finally {
    await prismaPublic.$disconnect();
  }

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`[CORS] Request from origin "${origin}" BLOCKED.`);
        callback(new Error('Origin tidak diizinkan oleh CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  // Konfigurasi Swagger
  const config = new DocumentBuilder()
    .setTitle('API Koperasi Merah Putih')
    .setDescription('Dokumentasi API untuk Sistem Koperasi Merah Putih')
    .setVersion('1.0')
    .addBearerAuth()
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'SuperAdminJWT',
        description: 'Enter Super Admin JWT token',
        in: 'header',
      },
      'superadmin-jwt',
    )
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
    .addTag('Gallery (Foto)')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3002);
}
void bootstrap();
