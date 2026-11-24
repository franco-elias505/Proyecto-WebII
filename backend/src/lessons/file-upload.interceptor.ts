import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import fileUpload from 'express-fileupload';
import type { Request, Response } from 'express';
import { from, switchMap } from 'rxjs';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp();
    const parse = new Promise<void>((accept, reject) => {
      fileUpload({
        limits: {
          fileSize: 25 * 1024 * 1024,
          files: 2,
          fields: 1,
          fieldSize: 1024,
          parts: 3,
        },
        uploadTimeout: 30_000,
      })(
        http.getRequest<Request>(),
        http.getResponse<Response>(),
        (error?: unknown) =>
          error
            ? reject(
                new BadRequestException(
                  'No se pudo procesar el archivo multipart.',
                ),
              )
            : accept(),
      );
    });
    return from(parse).pipe(switchMap(() => next.handle()));
  }
}
