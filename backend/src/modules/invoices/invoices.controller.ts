import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDate, IsEnum } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';
import { Type } from 'class-transformer';

class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  invoiceNumber!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dueDate!: Date;
}

class UpdateStatusDto {
  @IsEnum(InvoiceStatus)
  @IsNotEmpty()
  status!: InvoiceStatus;
}

@ApiTags('Invoices Management API')
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all invoices for business workspace' })
  async getInvoices(@CurrentUser() user: any) {
    return this.invoicesService.findAll(user.businessId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get revenue stats overview' })
  async getRevenueStats(@CurrentUser() user: any) {
    return this.invoicesService.getRevenueStats(user.businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific invoice details' })
  async getInvoice(@Param('id') id: string, @CurrentUser() user: any) {
    return this.invoicesService.findOne(id, user.businessId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new invoice record' })
  async createInvoice(@Body() dto: CreateInvoiceDto, @CurrentUser() user: any) {
    return this.invoicesService.create(user.businessId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.updateStatus(id, user.businessId, dto.status);
  }
}
