import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateCategory, CampaignStatus } from '@prisma/client';

@Injectable()
export class WhatsappService {
  constructor(private prisma: PrismaService) {}

  // 1. Templates Management
  async findTemplates(businessId: string) {
    return this.prisma.template.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTemplate(
    businessId: string,
    dto: { name: string; category: TemplateCategory; bodyText: string; languageCode?: string },
  ) {
    const existing = await this.prisma.template.findFirst({
      where: { businessId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException('Template name already exists in this business workspace.');
    }

    return this.prisma.template.create({
      data: {
        businessId,
        name: dto.name,
        category: dto.category,
        bodyText: dto.bodyText,
        languageCode: dto.languageCode || 'en',
        metaStatus: 'APPROVED', // Mock auto-approval by Meta
      },
    });
  }

  // 2. Campaign Broadcasts
  async findCampaigns(businessId: string) {
    return this.prisma.campaign.findMany({
      where: { businessId },
      include: { template: { select: { name: true, category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCampaign(
    businessId: string,
    dto: { name: string; templateId: string; scheduledAt?: Date; recipientCount: number },
  ) {
    // Check if template exists
    const template = await this.prisma.template.findFirst({
      where: { id: dto.templateId, businessId },
    });
    if (!template) {
      throw new NotFoundException('Selected message template not found in this business workspace.');
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        businessId,
        templateId: dto.templateId,
        name: dto.name,
        status: dto.scheduledAt ? CampaignStatus.SCHEDULED : CampaignStatus.COMPLETED,
        scheduledAt: dto.scheduledAt,
        recipientCount: dto.recipientCount,
      },
    });

    // Mock Dispatcher Log
    if (campaign.status === CampaignStatus.COMPLETED) {
      console.log(`[Wavo CRM WhatsApp Broadcaster] Dispatched campaign "${campaign.name}" to ${campaign.recipientCount} clients using template "${template.name}".`);
    }

    return campaign;
  }
}
