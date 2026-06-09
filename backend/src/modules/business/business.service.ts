import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async getProfile(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      throw new NotFoundException('Business account settings not found.');
    }
    return business;
  }

  async updateProfile(businessId: string, updateData: { name?: string; gstNumber?: string; address?: string }) {
    return this.prisma.business.update({
      where: { id: businessId },
      data: updateData,
    });
  }
}
