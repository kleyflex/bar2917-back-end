import { Body, Controller, Get, HttpCode, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentLocation } from 'src/auth/decorators/location.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { OrderDto } from './order.dto';
import { OrderService } from './order.service';
import { OrdersEnabledGuard } from './orders-enabled.guard';
import { PaymentStatusDto } from './payment-status.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @Auth('admin')
  getAll() {
    return this.orderService.getAllOrders()
  }

  @Get('by-user')
  @Auth()
  getByUserId(@CurrentUser('id') userId: number) {
    return this.orderService.getByUserId(userId)
  }

  @Get('by-location')
  @Auth('admin')
  getByLocationId(@CurrentLocation('id') locationId: number) {
    return this.orderService.getByLocationId(locationId)
  }


  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post()
  @UseGuards(OrdersEnabledGuard)
  @Auth()
  placeOrder(@Body() dto: OrderDto, @CurrentUser('id') userId: number, @CurrentLocation('id') locationId: number) {
    return this.orderService.placeOrder(dto, userId, locationId)
  }

  // Webhook YooKassa. Пока доставка выключена — закрыт флагом ORDERS_ENABLED (503).
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('status')
  @UseGuards(OrdersEnabledGuard)
  async updateStatus(@Body() dto: PaymentStatusDto) {
    return this.orderService.updateStatus(dto)
  }
}
