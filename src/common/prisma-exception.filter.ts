import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

// Маппинг кодов Prisma на HTTP-ответы единого формата
const PRISMA_ERROR_MAP: Record<string, { status: number; error: string; message: string }> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    error: 'Conflict',
    message: 'Запись с такими данными уже существует'
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    error: 'Not Found',
    message: 'Запись не найдена'
  },
  P2003: {
    status: HttpStatus.CONFLICT,
    error: 'Conflict',
    message: 'Операция невозможна: запись связана с другими данными'
  }
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const mapped = PRISMA_ERROR_MAP[exception.code] ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Внутренняя ошибка сервера'
    };

    response.status(mapped.status).json({
      message: mapped.message,
      error: mapped.error,
      statusCode: mapped.status
    });
  }
}
