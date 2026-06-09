import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  invoiceId!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod!: string;

  @IsString()
  @IsOptional()
  transactionReference?: string;
}

@ApiTags('Payments Ledger API')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payments recorded in business workspace' })
  async getPayments(@CurrentUser() user: any) {
    return this.paymentsService.findAll(user.businessId);
  }

  @Post()
  @ApiOperation({ summary: 'Record a new client transaction payment' })
  async createPayment(@Body() dto: CreatePaymentDto, @CurrentUser() user: any) {
    return this.paymentsService.create(user.businessId, dto);
  }
}
