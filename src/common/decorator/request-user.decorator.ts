import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const ReqUser = createParamDecorator(
  (propKey: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return propKey ? req.user[propKey] : req.user;
  },
);

export const ReqSocketUser = createParamDecorator(
  (propKey: string, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    return propKey ? client.user[propKey] : client.user;
  },
);
