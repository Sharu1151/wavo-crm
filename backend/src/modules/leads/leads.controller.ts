import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRoleName, LeadStage } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(LeadStage)
  @IsOptional()
  stage?: LeadStage;

  @IsNumber()
  @IsOptional()
  estimatedValue?: number;

  @IsString()
  @IsOptional()
  assignedToUserId?: string;
}

class UpdateLeadStageDto {
  @IsEnum(LeadStage)
  @IsNotEmpty()
  stage!: LeadStage;
}

class AssignLeadDto {
  @IsString()
  @IsNotEmpty()
  assignedToUserId!: string;
}

@ApiTags('Sales Leads API')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve sales pipeline leads structured for Kanban' })
  @ApiQuery({ name: 'assignedTo', required: false, type: String })
  async getPipeline(
    @CurrentUser('businessId') businessId: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.leadsService.getPipeline(businessId, assignedTo);
  }

  @Post()
  @Roles(UserRoleName.BUSINESS_OWNER, UserRoleName.MANAGER, UserRoleName.SALES_EXECUTIVE)
  @ApiOperation({ summary: 'Create a new sales lead and run AI Lead Scoring' })
  async create(
    @CurrentUser('businessId') businessId: string,
    @Body() dto: CreateLeadDto,
  ) {
    return this.leadsService.create(businessId, dto);
  }

  @Patch(':id/stage')
  @Roles(UserRoleName.BUSINESS_OWNER, UserRoleName.MANAGER, UserRoleName.SALES_EXECUTIVE)
  @ApiOperation({ summary: 'Update lead stage position (Kanban Drag-and-drop)' })
  async updateStage(
    @Param('id') id: string,
    @CurrentUser('businessId') businessId: string,
    @Body() dto: UpdateLeadStageDto,
  ) {
    return this.leadsService.updateStage(id, businessId, dto.stage);
  }

  @Patch(':id/assign')
  @Roles(UserRoleName.BUSINESS_OWNER, UserRoleName.MANAGER)
  @ApiOperation({ summary: 'Assign a lead to a sales representative' })
  async assignLead(
    @Param('id') id: string,
    @CurrentUser('businessId') businessId: string,
    @Body() dto: AssignLeadDto,
  ) {
    return this.leadsService.assignLead(id, businessId, dto.assignedToUserId);
  }
}
