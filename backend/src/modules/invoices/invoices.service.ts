import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string) {
    return this.prisma.invoice.findMany({
      where: { businessId },
      include: { customer: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, businessId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, businessId },
      include: { customer: true, payments: true },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found.');
    }
    return invoice;
  }

  async create(
    businessId: string,
    dto: { customerId: string; invoiceNumber: string; amount: number; tax?: number; dueDate: Date },
  ) {
    // Check if customer exists
    const customer = await this.prisma.customer.findFirst({
      where: { id: dto.customerId, businessId },
    });
    if (!customer) {
      throw new NotFoundException('Associated customer not found in this business workspace.');
    }

    // Check unique invoice number for business
    const existing = await this.prisma.invoice.findFirst({
      where: { businessId, invoiceNumber: dto.invoiceNumber },
    });
    if (existing) {
      throw new ConflictException('Invoice number already exists in this business workspace.');
    }

    return this.prisma.invoice.create({
      data: {
        businessId,
        customerId: dto.customerId,
        invoiceNumber: dto.invoiceNumber,
        amount: dto.amount,
        tax: dto.tax || 0,
        dueDate: dto.dueDate,
        status: InvoiceStatus.DRAFT,
      },
    });
  }

  async updateStatus(id: string, businessId: string, status: InvoiceStatus) {
    await this.findOne(id, businessId); // throws if not found
    return this.prisma.invoice.update({
      where: { id },
      data: { status },
    });
  }

  async getRevenueStats(businessId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { businessId },
    });

    let paid = 0;
    let pending = 0;
    let overdue = 0;

    const now = new Date();

    for (const inv of invoices) {
      const amt = Number(inv.amount) + Number(inv.tax);
      if (inv.status === InvoiceStatus.PAID) {
        paid += amt;
      } else if (inv.status === InvoiceStatus.CANCELLED) {
        // Skip
      } else {
        pending += amt;
        if (new Date(inv.dueDate) < now) {
          overdue += amt;
        }
      }
    }

    return { paid, pending, overdue };
  }
}
