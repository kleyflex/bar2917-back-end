import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const allowedOrigins = (process.env.APP_URL ?? 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim());

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: allowedOrigins,
    credentials: true
  })
  await app.listen(4200);
}
bootstrap();
