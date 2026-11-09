import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      this.logger.error(
        'Error al procesar una solicitud.',
        exception instanceof Error ? exception.name : undefined,
      );
    }

    const message =
      status < 500 && exception instanceof HttpException
        ? exception.message
        : 'Error interno del servidor.';
    const body =
      exception instanceof HttpException && status < 500
        ? exception.getResponse()
        : undefined;
    const details =
      typeof body === 'object' &&
      'message' in body &&
      Array.isArray(body.message)
        ? body.message
        : null;

    response.status(status).json({
      error: { code: HttpStatus[status] ?? 'HTTP_ERROR', message, details },
    });
  }
}
