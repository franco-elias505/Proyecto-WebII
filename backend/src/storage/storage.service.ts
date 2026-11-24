import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { UploadedFile } from 'express-fileupload';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly root = resolve(
    process.env.UPLOAD_DIR ?? resolve(__dirname, '../../uploads'),
  );

  async save(lessonId: number, file: UploadedFile) {
    if (file.truncated)
      throw new PayloadTooLargeException('El archivo supera los 25 MB.');
    if (!file.size) throw new BadRequestException('El archivo está vacío.');
    const bytes = file.data;
    const signatures: Record<string, { extension: string; valid: boolean }> = {
      'application/pdf': {
        extension: 'pdf',
        valid: bytes.subarray(0, 5).toString() === '%PDF-',
      },
      'image/png': {
        extension: 'png',
        valid: bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      },
      'image/jpeg': {
        extension: 'jpg',
        valid: bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])),
      },
      'video/mp4': {
        extension: 'mp4',
        valid: bytes.subarray(4, 8).toString() === 'ftyp',
      },
      'video/webm': {
        extension: 'webm',
        valid: bytes.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163])),
      },
    };
    const format = signatures[file.mimetype];
    if (!format?.valid)
      throw new BadRequestException(
        'Usa PDF, PNG, JPEG, MP4 o WebM con contenido válido.',
      );
    const id = randomUUID();
    const filename = id + '.' + format.extension;
    await mkdir(resolve(this.root, String(lessonId)), { recursive: true });
    try {
      await writeFile(this.path(lessonId, filename), bytes, { flag: 'wx' });
    } catch (error) {
      await this.remove(lessonId, filename);
      throw error;
    }
    return {
      id,
      nombre_guardado: filename,
      tipo_mime: file.mimetype,
      tamano: file.size,
      nombre_original:
        Array.from(file.name)
          .map((character) =>
            character.charCodeAt(0) < 32 ||
            character.charCodeAt(0) === 127 ||
            character === '/' ||
            character === '\\'
              ? '-'
              : character,
          )
          .slice(0, 200)
          .join('') || filename,
    };
  }

  private path(lessonId: number, filename: string) {
    if (
      !Number.isSafeInteger(lessonId) ||
      lessonId <= 0 ||
      !/^[a-f0-9-]+\.(pdf|png|jpg|mp4|webm)$/.test(filename)
    ) {
      throw new BadRequestException('Identificador de archivo inválido.');
    }
    return resolve(this.root, String(lessonId), filename);
  }

  async read(lessonId: number, filename: string) {
    const path = this.path(lessonId, filename);
    try {
      await stat(path);
    } catch {
      throw new NotFoundException('Archivo no encontrado.');
    }
    return createReadStream(path);
  }

  async remove(lessonId: number, filename: string) {
    try {
      await rm(this.path(lessonId, filename), { force: true });
    } catch {
      this.logger.warn('No se pudo limpiar un archivo retirado.');
    }
  }

  async removeLesson(lessonId: number) {
    if (!Number.isSafeInteger(lessonId) || lessonId <= 0) return;
    const directory = resolve(this.root, String(lessonId));
    try {
      await rm(directory, { recursive: true, force: true });
    } catch {
      this.logger.warn(
        'No se pudo limpiar el directorio de una lección retirada.',
      );
    }
  }
}
