import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError } from 'typeorm';
import { ERROR_MESSAGES } from '../constants/error-messages';

type PostgresErrorLike = {
  code?: string;
  message?: string;
  detail?: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (exception instanceof EntityNotFoundError) {
      return this.reply(res, req, HttpStatus.NOT_FOUND, {
        message: ERROR_MESSAGES.ENTITY_NOT_FOUND,
      });
    }

    if (exception instanceof PayloadTooLargeException) {
      return this.reply(res, req, HttpStatus.PAYLOAD_TOO_LARGE, {
        message: ERROR_MESSAGES.FILE_TOO_LARGE,
      });
    }

    const pgCode = this.getPostgresCode(exception);
    if (pgCode === '23505') {
      return this.reply(res, req, HttpStatus.CONFLICT, {
        message: ERROR_MESSAGES.DUPLICATE,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const payload = typeof body === 'string' ? { message: body } : body;

      return this.reply(res, req, status, payload as Record<string, any>);
    }

    return this.reply(res, req, HttpStatus.INTERNAL_SERVER_ERROR, {
      message: ERROR_MESSAGES.INTERNAL,
    });
  }

  private getPostgresCode(exception: unknown): string | undefined {
    if (!exception || typeof exception !== 'object') return undefined;

    const anyEx = exception as {
      code?: string;
      driverError?: PostgresErrorLike;
    };
    return anyEx.code ?? anyEx.driverError?.code;
  }

  private reply(
    res: Response,
    req: Request,
    statusCode: number,
    payload: Record<string, any>,
  ): void {
    res.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      ...payload,
    });
  }
}
