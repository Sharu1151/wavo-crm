import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = { businessId };
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { mobileNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: { tags: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        totalItems: total,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, businessId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, businessId },
      include: { tags: true },
    });
    if (!customer) {
      throw new NotFoundException('Customer profile not found in your workspace.');
    }
    return customer;
  }

  async create(
    businessId: string,
    dto: { fullName: string; mobileNumber: string; email?: string; company?: string; source?: string; tags?: string[] },
  ) {
    // Check E.164 phone duplication inside business context
    const existing = await this.prisma.customer.findUnique({
      where: {
        businessId_mobileNumber: { businessId, mobileNumber: dto.mobileNumber },
      },
    });

    if (existing) {
      throw new ConflictException('Customer with this mobile number already exists in your workspace.');
    }

    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          businessId,
          fullName: dto.fullName,
          mobileNumber: dto.mobileNumber,
          email: dto.email,
          company: dto.company,
          source: dto.source || 'Direct',
        },
      });

      if (dto.tags && dto.tags.length > 0) {
        await tx.customerTag.createMany({
          data: dto.tags.map((tag) => ({
            customerId: customer.id,
            tagName: tag,
          })),
        });
      }

      // Record audit log entry
      await tx.auditLog.create({
        data: {
          businessId,
          action: 'create_customer',
          targetTable: 'customers',
          recordId: customer.id,
          payloadAfter: JSON.parse(JSON.stringify(customer)),
        },
      });

      return customer;
    });
  }

  async update(
    id: string,
    businessId: string,
    dto: { fullName?: string; email?: string; company?: string; status?: string },
  ) {
    const customer = await this.findOne(id, businessId);

    const updated = await this.prisma.customer.update({
      where: { id: customer.id },
      data: dto,
    });

    // Record mutation audit log
    await this.prisma.auditLog.create({
      data: {
        businessId,
        action: 'update_customer',
        targetTable: 'customers',
        recordId: id,
        payloadBefore: JSON.parse(JSON.stringify(customer)),
        payloadAfter: JSON.parse(JSON.stringify(updated)),
      },
    });

    return updated;
  }

  async remove(id: string, businessId: string) {
    const customer = await this.findOne(id, businessId);
    
    await this.prisma.customer.delete({
      where: { id: customer.id },
    });

    await this.prisma.auditLog.create({
      data: {
        businessId,
        action: 'delete_customer',
        targetTable: 'customers',
        recordId: id,
        payloadBefore: JSON.parse(JSON.stringify(customer)),
      },
    });

    return { success: true, message: 'Customer profile deleted successfully.' };
  }
}
