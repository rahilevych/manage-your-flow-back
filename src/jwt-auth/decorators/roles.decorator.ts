import { SetMetadata } from '@nestjs/common';
import { MemberRole } from 'src/generated/prisma/enums';

export const Roles = (...roles: MemberRole[]) => SetMetadata('roles', roles);
