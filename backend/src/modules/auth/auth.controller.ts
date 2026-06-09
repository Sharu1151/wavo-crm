import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

// 1. INPUT SCHEMAS (DTOS)
class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  businessName!: string;
}

class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;
}

class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;
}

@ApiTags('Authentication API Gateway')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login using email and password' })
  @ApiResponse({ status: 200, description: 'JWT tokens generated successfully.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login({ email: dto.email, password_hash: dto.password });
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new Business Owner account' })
  @ApiResponse({ status: 201, description: 'Account created & subscription trials initiated.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.registerOwner({
      email: dto.email,
      password_hash: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      businessName: dto.businessName,
    });
  }

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send verification OTP to a mobile phone number' })
  async sendOtp(@Body() dto: RequestOtpDto) {
    return this.authService.triggerOTP(dto.phoneNumber);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP code and authenticate user' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOTPAndLogin(dto.phoneNumber, dto.code);
  }
}
