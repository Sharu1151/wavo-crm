import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

class UpdateBusinessDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  gstNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

@ApiTags('Business Profiles API')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('business')
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Retrieve authenticated business tenant details' })
  async getProfile(@CurrentUser('businessId') businessId: string) {
    return this.businessService.getProfile(businessId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update business tenant profile and GST configs' })
  async updateProfile(
    @CurrentUser('businessId') businessId: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessService.updateProfile(businessId, dto);
  }
}
