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
import { SupervisoryPositionsModule } from './supervisory-positions/supervisory-positions.module';
import { SimpananModule } from './simpanan/simpanan.module';
import { SimpananController } from './simpanan/simpanan.controller';
import { SimpananService } from './simpanan/simpanan.service';
import { LoansModule } from './loans/loans.module';
import { InventoryModule } from './inventory/inventory.module';
import { MemberMeetingNotesModule } from './member-meeting-notes/member-meeting-notes.module';
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
    SupervisoryPositionsModule,
    SimpananModule,
    LoansModule,
    InventoryModule,
    MemberMeetingNotesModule,
  ],
  controllers: [AppController, SimpananController],
  providers: [AppService, SimpananService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenancyMiddleware).forRoutes('*');
  }
}
