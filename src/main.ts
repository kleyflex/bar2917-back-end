import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/prisma-exception.filter';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const configService = app.get(ConfigService);

  // Дефолты гарантированы Joi-схемой; фолбэки — для строгой типизации
  const allowedOrigins = (configService.get<string>('APP_URL') ?? 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim());

  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.useGlobalFilters(new PrismaExceptionFilter())
  app.enableCors({
    origin: allowedOrigins,
    credentials: true
  })
  // По умолчанию слушаем только localhost: снаружи API доступен лишь через nginx
  await app.listen(
    configService.get<number>('PORT') ?? 4200,
    configService.get<string>('HOST') ?? '127.0.0.1'
  );
}
bootstrap();
