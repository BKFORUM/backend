import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const ReqUser = createParamDecorator(
  (propKey: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return propKey ? req.user[propKey] : req.user;
  },
);
