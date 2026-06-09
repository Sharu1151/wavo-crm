import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsDate } from 'class-validator';
import { TemplateCategory } from '@prisma/client';
import { Type } from 'class-transformer';

class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(TemplateCategory)
  @IsNotEmpty()
  category!: TemplateCategory;

  @IsString()
  @IsNotEmpty()
  bodyText!: string;

  @IsString()
  @IsOptional()
  languageCode?: string;
}

class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  templateId!: string;

  @IsNumber()
  @IsNotEmpty()
  recipientCount!: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  scheduledAt?: Date;
}

@ApiTags('WhatsApp Broadcast & Templates API')
@UseGuards(JwtAuthGuard)
@Controller('whatsapp')
export class WhatsappController {
  constructor(private whatsappService: WhatsappService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get all WhatsApp templates for business' })
  async getTemplates(@CurrentUser() user: any) {
    return this.whatsappService.findTemplates(user.businessId);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create a new template' })
  async createTemplate(@Body() dto: CreateTemplateDto, @CurrentUser() user: any) {
    return this.whatsappService.createTemplate(user.businessId, dto);
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get all campaign broadcasts' })
  async getCampaigns(@CurrentUser() user: any) {
    return this.whatsappService.findCampaigns(user.businessId);
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Schedule/Launch a new campaign broadcast' })
  async createCampaign(@Body() dto: CreateCampaignDto, @CurrentUser() user: any) {
    return this.whatsappService.createCampaign(user.businessId, dto);
  }
}
