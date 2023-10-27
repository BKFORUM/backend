import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ErrorInterface, getError } from './error';
import { Request, Response } from 'express';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    console.log(exception);

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      const { errorId, message, error } =
        exception.getResponse() as ErrorInterface;

      return response.status(status).json({
        success: false,
        code: status,
        errorId:
          errorId !== null && errorId !== undefined
            ? errorId
            : HttpStatus[status],
        message,
        error,
        timestamp: new Date().getTime(),
        path: request.url,
      });
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const error = getError(exception);

    return response.status(status).json({
      success: false,
      code: status,
      errorId: HttpStatus[status],
      message: 'Internal server error',
      error: error.message,
      timestamp: new Date().getTime(),
      path: request.url,
    });
  }
}
