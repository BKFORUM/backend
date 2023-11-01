import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch(WsException, HttpException)
export class WebsocketExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToWs();
    const client = ctx.getClient();

    console.log(exception);
    if (exception instanceof WsException) {
      client.emit('error', exception.getError());
    } else if (exception instanceof HttpException) {
      client.emit('error', exception.getResponse());
    }
  }
}
