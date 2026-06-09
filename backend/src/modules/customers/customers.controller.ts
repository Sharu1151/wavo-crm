import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  mobileNumber!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsOptional()
  tags?: string[];
}

class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

@ApiTags('Customer Profiles API')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customer profiles (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @CurrentUser('businessId') businessId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.customersService.findAll(businessId, page || 1, limit || 20, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve specific customer profile details' })
  async findOne(@Param('id') id: string, @CurrentUser('businessId') businessId: string) {
    return this.customersService.findOne(id, businessId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer profile' })
  async create(
    @CurrentUser('businessId') businessId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.create(businessId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer details' })
  async update(
    @Param('id') id: string,
    @CurrentUser('businessId') businessId: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, businessId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a customer profile' })
  async remove(@Param('id') id: string, @CurrentUser('businessId') businessId: string) {
    return this.customersService.remove(id, businessId);
  }
}
