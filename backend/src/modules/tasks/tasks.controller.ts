import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TaskPriority } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  assignedToUserId?: string;
}

@ApiTags('Team Tasks API')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('my-tasks')
  @ApiOperation({ summary: 'List tasks assigned to the current authenticated user' })
  async getMyTasks(
    @CurrentUser('id') userId: string,
    @CurrentUser('businessId') businessId: string,
  ) {
    return this.tasksService.findMyTasks(userId, businessId);
  }

  @Post()
  @ApiOperation({ summary: 'Create and allocate a new task to a teammate' })
  async create(
    @CurrentUser('businessId') businessId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(businessId, dto);
  }
}
