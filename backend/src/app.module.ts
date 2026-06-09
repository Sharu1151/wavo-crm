import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessModule } from './modules/business/business.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LeadsModule } from './modules/leads/leads.module';
import { FollowupsModule } from './modules/followups/followups.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { AiModule } from './modules/ai/ai.module';
import { BillingModule } from './modules/billing/billing.module';

@Module({
  imports: [
    // Global App Configuration module loader
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    BusinessModule,
    CustomersModule,
    LeadsModule,
    FollowupsModule,
    TasksModule,
    InvoicesModule,
    PaymentsModule,
    WhatsappModule,
    AiModule,
    BillingModule,
  ],
})
export class AppModule {}
