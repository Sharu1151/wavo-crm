import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlanType } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getLimits(businessId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { businessId },
    });

    const plan = subscription?.planType || SubscriptionPlanType.FREE;

    const limits = {
      [SubscriptionPlanType.FREE]: { maxCustomers: 50, maxUsers: 1, name: 'Free Tier' },
      [SubscriptionPlanType.PRO]: { maxCustomers: 1000000, maxUsers: 3, name: 'Pro Tier' },
      [SubscriptionPlanType.BUSINESS]: { maxCustomers: 1000000, maxUsers: 15, name: 'Business Tier' },
      [SubscriptionPlanType.ENTERPRISE]: { maxCustomers: 1000000, maxUsers: 1000000, name: 'Enterprise Tier' },
    };

    return {
      plan,
      status: subscription?.status || 'ACTIVE',
      billingCycleEnd: subscription?.billingCycleEnd,
      ...limits[plan],
    };
  }

  async validateCustomerLimit(businessId: string) {
    const limits = await this.getLimits(businessId);
    const count = await this.prisma.customer.count({ where: { businessId } });
    if (count >= limits.maxCustomers) {
      throw new ForbiddenException(`Customer limit reached. Your "${limits.name}" plan allows up to ${limits.maxCustomers} customers.`);
    }
  }

  async validateUserLimit(businessId: string) {
    const limits = await this.getLimits(businessId);
    const count = await this.prisma.user.count({ where: { businessId } });
    if (count >= limits.maxUsers) {
      throw new ForbiddenException(`User seat limit reached. Your "${limits.name}" plan allows up to ${limits.maxUsers} users.`);
    }
  }
}
