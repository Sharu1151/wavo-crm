import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'wavo_secret_anchor_2026',
    });
  }

  async validate(payload: { sub: string; email: string; businessId: string }) {
    // Check if the user exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Active session not found or account is suspended.');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      role: user.role.name, // maps UserRoleName enum value
      businessId: user.businessId,
    };
  }
}
