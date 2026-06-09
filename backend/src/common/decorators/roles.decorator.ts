import { SetMetadata } from '@nestjs/common';
import { UserRoleName } from '@prisma/client';

export const ROLES_KEY = 'roles';
// Assigns role array metadata to target controller routes
export const Roles = (...roles: UserRoleName[]) => SetMetadata(ROLES_KEY, roles);
