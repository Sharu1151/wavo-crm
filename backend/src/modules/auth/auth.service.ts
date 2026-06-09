import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRoleName } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. Password Login
  async login(dto: { email: string; password_hash: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email credentials or account inactive.');
    }

    const isMatch = await bcrypt.compare(dto.password_hash, user.passwordHash || '');
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.generateTokens(user.id, user.email || '', user.role.name, user.businessId || '');
  }

  // 2. Business Owner Registration
  async registerOwner(dto: {
    email: string;
    password_hash: string;
    firstName: string;
    lastName: string;
    businessName: string;
  }) {
    // Check duplication
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('User email already registered.');
    }

    const hashed = await bcrypt.hash(dto.password_hash, 10);

    return this.prisma.$transaction(async (tx) => {
      // Create business tenant
      const business = await tx.business.create({
        data: {
          name: dto.businessName,
        },
      });

      // Find role OR create
      let role = await tx.role.findUnique({ where: { name: UserRoleName.BUSINESS_OWNER } });
      if (!role) {
        role = await tx.role.create({
          data: { name: UserRoleName.BUSINESS_OWNER, description: 'Business Owner Tenant Admin' },
        });
      }

      // Create owner user
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash: hashed,
          firstName: dto.firstName,
          lastName: dto.lastName,
          businessId: business.id,
          roleId: role.id,
        },
      });

      // Setup initial Free subscription cycle
      await tx.subscription.create({
        data: {
          businessId: business.id,
          planType: 'FREE',
          status: 'ACTIVE',
          billingCycleStart: new Date(),
          billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days trial
        },
      });

      return this.generateTokens(user.id, user.email || '', role.name, business.id);
    });
  }

  // 3. OTP Trigger Placeholder (Sends Twilio code or logs code to stdout in dev)
  async triggerOTP(phoneNumber: string) {
    const code = '123456'; // Default sandbox verification code
    // In production: store inside Redis with a TTL of 300s
    // await this.redis.set(`otp:${phoneNumber}`, code, 'EX', 300);
    console.log(`[Wavo CRM SMS Sandbox] Generated verification code for ${phoneNumber} : ${code}`);
    return { success: true, message: 'OTP dispatched successfully (sandbox: 123456).' };
  }

  // 4. OTP Verification Login
  async verifyOTPAndLogin(phoneNumber: string, code: string) {
    // Sandbox verification logic
    if (code !== '123456') {
      throw new UnauthorizedException('Invalid verification OTP code.');
    }

    let user = await this.prisma.user.findUnique({
      where: { phoneNumber },
      include: { role: true },
    });

    if (!user) {
      // If user is logging in via OTP for first time, register them under a new trial business tenant
      return this.registerOwnerByPhone(phoneNumber);
    }

    return this.generateTokens(user.id, user.email || '', user.role.name, user.businessId || '');
  }

  private async registerOwnerByPhone(phoneNumber: string) {
    return this.prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: { name: `My Business (${phoneNumber.slice(-4)})` },
      });

      let role = await tx.role.findUnique({ where: { name: UserRoleName.BUSINESS_OWNER } });
      if (!role) {
        role = await tx.role.create({
          data: { name: UserRoleName.BUSINESS_OWNER, description: 'Business Owner Tenant Admin' },
        });
      }

      const user = await tx.user.create({
        data: {
          phoneNumber,
          firstName: 'Guest',
          businessId: business.id,
          roleId: role.id,
        },
      });

      await tx.subscription.create({
        data: {
          businessId: business.id,
          planType: 'FREE',
          status: 'ACTIVE',
          billingCycleStart: new Date(),
          billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return this.generateTokens(user.id, '', role.name, business.id);
    });
  }

  // Generate Session Tokens
  private async generateTokens(userId: string, email: string, role: string, businessId: string) {
    const payload = { email, role, businessId, sub: userId };
    
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user: {
        id: userId,
        email,
        role,
        businessId,
      },
    };
  }
}
