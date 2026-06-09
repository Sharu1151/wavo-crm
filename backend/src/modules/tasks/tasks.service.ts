import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskPriority, TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findMyTasks(userId: string, businessId: string) {
    return this.prisma.task.findMany({
      where: { businessId, assignedToUserId: userId },
      orderBy: { dueDate: 'asc' },
    });
  }

  async create(
    businessId: string,
    dto: { title: string; description?: string; dueDate?: Date; priority?: TaskPriority; assignedToUserId?: string },
  ) {
    if (dto.assignedToUserId) {
      const user = await this.prisma.user.findFirst({
        where: { id: dto.assignedToUserId, businessId },
      });
      if (!user) {
        throw new NotFoundException('Assigned user not found in this business workspace.');
      }
    }

    return this.prisma.task.create({
      data: {
        businessId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate,
        priority: dto.priority || TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        assignedToUserId: dto.assignedToUserId,
      },
    });
  }
}
