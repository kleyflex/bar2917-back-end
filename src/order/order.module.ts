import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [ConfigModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService],
})
export class OrderModule {}
