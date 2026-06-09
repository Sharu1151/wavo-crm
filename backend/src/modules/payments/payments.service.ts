import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, InvoiceStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string) {
    return this.prisma.payment.findMany({
      where: { businessId },
      include: { invoice: { select: { invoiceNumber: true, amount: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    businessId: string,
    dto: { invoiceId: string; amount: number; paymentMethod: string; transactionReference?: string },
  ) {
    // Check if invoice exists
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, businessId },
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found in this business workspace.');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already paid.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          businessId,
          invoiceId: dto.invoiceId,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          transactionReference: dto.transactionReference,
          status: PaymentStatus.SUCCESSFUL, // Auto-succeed local recorded payments
          receivedAt: new Date(),
        },
      });

      // Update invoice status to PAID
      await tx.invoice.update({
        where: { id: dto.invoiceId },
        data: { status: InvoiceStatus.PAID },
      });

      return payment;
    });
  }
}
