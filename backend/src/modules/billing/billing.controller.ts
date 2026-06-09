import { Controller, Get, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Billing & Subscriptions API')
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('limits')
  @ApiOperation({ summary: 'Get workspace subscription plan limits' })
  async getLimits(@CurrentUser() user: any) {
    return this.billingService.getLimits(user.businessId);
  }
}
