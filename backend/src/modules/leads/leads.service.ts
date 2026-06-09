import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeadStage } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async getPipeline(businessId: string, assignedToUserId?: string) {
    const where: any = { businessId };
    
    if (assignedToUserId) {
      where.assignedToUserId = assignedToUserId;
    }

    return this.prisma.lead.findMany({
      where,
      include: {
        customer: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, businessId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, businessId },
      include: { customer: true, assignedTo: true },
    });
    if (!lead) {
      throw new NotFoundException('Lead profile not found in your business workspace.');
    }
    return lead;
  }

  async create(
    businessId: string,
    dto: { customerId: string; title: string; stage?: LeadStage; estimatedValue?: number; assignedToUserId?: string },
  ) {
    // Verify customer exists in this tenant
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, businessId },
    });
    if (!customer) {
      throw new NotFoundException('Target customer profile not found.');
    }

    // Lead Scoring - Mock integration
    // Logic scans customer source and tags to generate initial score
    const score = Math.floor(Math.random() * 40) + 50; // Random baseline score: 50-90

    return this.prisma.lead.create({
      data: {
        businessId,
        customerId: dto.customerId,
        title: dto.title,
        stage: dto.stage || LeadStage.NEW,
        estimatedValue: dto.estimatedValue || 0.00,
        assignedToUserId: dto.assignedToUserId,
        leadScore: score,
      },
    });
  }

  async updateStage(id: string, businessId: string, stage: LeadStage) {
    const lead = await this.findOne(id, businessId);

    return this.prisma.lead.update({
      where: { id: lead.id },
      data: { stage },
    });
  }

  async assignLead(id: string, businessId: string, assignedToUserId: string) {
    const lead = await this.findOne(id, businessId);

    // Verify target representative user belongs to business
    const user = await this.prisma.user.findFirst({
      where: { id: assignedToUserId, businessId },
    });
    if (!user) {
      throw new NotFoundException('Sales representative not found in your business team.');
    }

    return this.prisma.lead.update({
      where: { id: lead.id },
      data: { assignedToUserId },
    });
  }
}
