import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Triggers connection pool initialization on startup
    await this.$connect();
  }

  async onModuleDestroy() {
    // Closes active connections gracefully on app shutdown
    await this.$disconnect();
  }
}
