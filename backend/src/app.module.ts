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
import { BoardMeetingNotesModule } from './board-meeting-notes/board-meeting-notes.module';
import { SupervisoryMeetingNotesModule } from './supervisory-meeting-notes/supervisory-meeting-notes.module';
import { EmployeesModule } from './employees/employees.module';
import { MemberRegistrationsModule } from './member-registrations/member-registrations.module';
import { GuestBookModule } from './guest-book/guest-book.module';
import { MemberSuggestionModule } from './member-suggestion/member-suggestion.module';
import { SupervisorySuggestionModule } from './supervisory-suggestion/supervisory-suggestion.module';
import { UsersModule } from './users/users.module';
import { OfficialRecommendationModule } from './official-recommendation/official-recommendation.module';
import { ImportantEventModule } from './important-event/important-event.module';
import { AgendaExpeditionModule } from './agenda-expedition/agenda-expedition.module';
import { UploadsModule } from './uploads/uploads.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { CooperativeProfileModule } from './cooperative-profile/cooperative-profile.module';
import { ProfileModule } from './profile/profile.module';
import { ArticlesModule } from './articles/articles.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductsModule } from './products/products.module';
import { GalleryModule } from './gallery/gallery.module';
import { SuperAdminAuthModule } from './admin/super-admin-auth/super-admin-auth.module';
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
    BoardMeetingNotesModule,
    SupervisoryMeetingNotesModule,
    EmployeesModule,
    MemberRegistrationsModule,
    GuestBookModule,
    MemberSuggestionModule,
    SupervisorySuggestionModule,
    UsersModule,
    OfficialRecommendationModule,
    ImportantEventModule,
    AgendaExpeditionModule,
    UploadsModule,
    EmailModule,
    CooperativeProfileModule,
    ProfileModule,
    ArticlesModule,
    ProductCategoriesModule,
    ProductsModule,
    GalleryModule,
    SuperAdminAuthModule,
  ],
  controllers: [AppController, SimpananController],
  providers: [AppService, SimpananService, EmailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenancyMiddleware).forRoutes('*');
  }
}
