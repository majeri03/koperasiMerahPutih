import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenancyModule } from './tenancy/tenancy.module';
import { TenancyMiddleware } from './tenancy/tenancy.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PublicModule } from './public/public.module';
import { MidtransModule } from './midtrans/midtrans.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { MembersModule } from './members/members.module';
import { BoardPositionsModule } from './board-positions/board-positions.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TenancyModule,
    PrismaModule,
    TenantsModule,
    AuthModule,
    PublicModule,
    MidtransModule,
    WebhooksModule,
    MembersModule,
    BoardPositionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenancyMiddleware).forRoutes('*');
  }
}
