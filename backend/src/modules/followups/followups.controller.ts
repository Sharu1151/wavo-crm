import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FollowupsService } from './followups.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReminderType } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreateFollowupDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsEnum(ReminderType)
  @IsNotEmpty()
  type!: ReminderType;

  @IsDate()
  @IsNotEmpty()
  scheduledAt!: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  leadId?: string;
}

@ApiTags('Follow-up Reminders API')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('followups')
export class FollowupsController {
  constructor(private followupsService: FollowupsService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Retrieve scheduled pending reminders' })
  async getPending(@CurrentUser('businessId') businessId: string) {
    return this.followupsService.findAllPending(businessId);
  }

  @Post()
  @ApiOperation({ summary: 'Create/Schedule a new customer follow-up reminder' })
  async create(
    @CurrentUser('businessId') businessId: string,
    @Body() dto: CreateFollowupDto,
  ) {
    return this.followupsService.create(businessId, dto);
  }
}
