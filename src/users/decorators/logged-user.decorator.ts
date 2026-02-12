import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface LoggedUser {
  userId: string;
  email: string;
  memberId?: string;
  role?: string;
}
export const LoggedUser = createParamDecorator(
  (field: keyof LoggedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as LoggedUser;
    return field ? user?.[field] : user;
  },
);
