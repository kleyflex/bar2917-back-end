import { CanActivate, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersEnabledGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(): boolean {
    if (this.configService.get('ORDERS_ENABLED') !== 'true') {
      throw new ServiceUnavailableException('Оформление заказов временно недоступно');
    }

    return true;
  }
}
