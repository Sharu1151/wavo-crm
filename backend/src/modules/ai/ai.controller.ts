import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

class GenerateOutreachDto {
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  businessName!: string;

  @IsString()
  @IsNotEmpty()
  details!: string;

  @IsString()
  @IsNotEmpty()
  tone!: string;
}

@ApiTags('AI Cognitive CRM Extensions API')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('score-lead/:id')
  @ApiOperation({ summary: 'Predict lead conversion probability score' })
  async scoreLead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.aiService.scoreLead(id, user.businessId);
  }

  @Post('generate-outreach')
  @ApiOperation({ summary: 'Draft outreach messages in a chosen tone' })
  async generateOutreach(@Body() dto: GenerateOutreachDto) {
    return this.aiService.generateOutreach(dto);
  }

  @Get('reply-suggestions')
  @ApiOperation({ summary: 'Generate reply suggestions' })
  async suggestReplies(@Query('message') message: string) {
    return this.aiService.suggestReplies(message);
  }

  @Get('summarize-timeline/:id')
  @ApiOperation({ summary: 'Generate timeline logs summaries' })
  async summarizeTimeline(@Param('id') id: string, @CurrentUser() user: any) {
    return this.aiService.summarizeTimeline(id, user.businessId);
  }
}
