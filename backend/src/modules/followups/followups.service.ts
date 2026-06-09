import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReminderType, FollowUpStatus } from '@prisma/client';

@Injectable()
export class FollowupsService {
  constructor(private prisma: PrismaService) {}

  async findAllPending(businessId: string) {
    return this.prisma.followUp.findMany({
      where: { businessId, status: FollowUpStatus.PENDING },
      include: { customer: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async create(
    businessId: string,
    dto: { customerId: string; type: ReminderType; scheduledAt: Date; notes?: string; leadId?: string },
  ) {
    // Verify customer
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, businessId },
    });
    if (!customer) {
      throw new NotFoundException('Target customer profile not found.');
    }

    return this.prisma.followUp.create({
      data: {
        businessId,
        customerId: dto.customerId,
        type: dto.type,
        scheduledAt: dto.scheduledAt,
        notes: dto.notes,
        leadId: dto.leadId,
      },
    });
  }
}
