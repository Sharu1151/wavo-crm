import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessModule } from './modules/business/business.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LeadsModule } from './modules/leads/leads.module';
import { FollowupsModule } from './modules/followups/followups.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { PrismaModule } from './modules/prisma/prisma.module';

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
  ],
})
export class AppModule {}
