import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import { path } from 'app-root-path';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { envValidationSchema } from './config/env.validation';
import { FeedbackModule } from './feedback/feedback.module';
import { LocationModule } from './location/location.module';
import { OrderModule } from './order/order.module';
import { PrismaModule } from './prisma.module';
import { ProductModule } from './product/product.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema
    }),
    ThrottlerModule.forRoot([{
      ttl: 60_000,
      limit: 10
    }]),
    ServeStaticModule.forRoot({
      rootPath: `${path}/assets`,
      serveRoot: '/assets', // URL-префикс для доступа к статическим файлам
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ProductModule,
    FeedbackModule,
    CategoryModule,
    OrderModule,
    StatisticsModule,
    LocationModule
  ],
})
export class AppModule {}

