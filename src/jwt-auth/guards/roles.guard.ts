import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from 'src/database/database.service';
import { LoggedUser } from 'src/users/decorators/logged-user.decorator';
import { MemberRole } from '@prisma/client';
import { MembersService } from 'src/members/members.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private db: DatabaseService,
    private memberService: MembersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<MemberRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as LoggedUser;
    const workspaceId = request.params.workspaceId || request.body.workspaceId;
    if (!workspaceId) {
      throw new ForbiddenException('Workspace ID not provided');
    }
    const member = await this.memberService.find(user.userId, workspaceId);
    if (!member) return false;

    return roles.includes(member.role);
  }
}
