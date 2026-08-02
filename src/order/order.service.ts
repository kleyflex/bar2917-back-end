import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnumOrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ProductService } from 'src/product/product.service';
import { productReturnObject } from 'src/product/return-product.object';
import * as YooKassa from 'yookassa';
import { OrderDto } from './order.dto';
import { PaymentStatusDto } from './payment-status.dto';

@Injectable()
export class OrderService {
  private readonly yooKassa: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private productService: ProductService
  ) {
    this.yooKassa = new YooKassa({
      shopId: this.configService.get('SHOP_ID'),
      secretKey: this.configService.get('PAYMENT_TOKEN')
    });
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        items: {
          include: {
            product: {
              select: productReturnObject
            }
          }
        }
      }
    })
  }

  async getByUserId(userId: number) {
    return this.prisma.order.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        items: {
          include: {
            product: {
              select: productReturnObject
            }
          }
        }
      }
    })
  }

  async getByLocationId(locationId: number) {
    return this.prisma.order.findMany({
      where: {
        locationId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        items: {
          include: {
            product: {
              select: productReturnObject
            }
          }
        }
      }
    })
  }


  async placeOrder(dto: OrderDto, userId: number) {
    // Цены берутся из БД по локации — клиентским ценам не доверяем
    const items = await Promise.all(
      dto.items.map(async item => ({
        quantity: item.quantity,
        productId: item.productId,
        price: await this.productService.getProductPrice(item.productId, dto.locationId)
      }))
    );

    const deliveryPrice = this.configService.get<number>('DELIVERY_PRICE') ?? 100;

    const total = items.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0) + deliveryPrice;

    const order = await this.prisma.order.create({
      data: {
        address: dto.address,
        commentary: dto.commentary,
        deliveryDate: dto.deliveryDate,
        deliveryTime: dto.deliveryTime,
        total,
        location: {
          connect: {
            id: dto.locationId
          }
        },
        items: {
          create: items
        },
        user: {
          connect: {
            id: userId
          }
        }
      }
    })

    const payment = await this.yooKassa.createPayment({
      amount: {
        value: total.toFixed(2),
        currency: 'RUB'
      },
      payment_method_data: {
        type: 'bank_card'
      },
      confirmation: {
        type:'redirect',
        return_url: this.configService.get('RETURN_URL')
      },
      description: `Заказ #${order.id}`,
      metadata: {
        orderId: String(order.id)
      }
    })

    return payment
}

  // Endpoint закрыт OrdersEnabledGuard, пока доставка выключена.
  // TODO перед включением доставки:
  // 1) запросить платёж обратно у YooKassa по dto.object.id и сверить статус/сумму/metadata.orderId;
  // 2) отфильтровать запросы по официальным IP-диапазонам YooKassa;
  // 3) переводить заказ в PAYED только по данным, полученным от YooKassa, а не из тела запроса.
  async updateStatus(dto: PaymentStatusDto){
    if (dto.event === 'payment.waiting_for_capture') {
      const payment = await this.yooKassa.capturePayment(dto.object.id)

      return payment
    }

    if (dto.event === 'payment.succeeded') {
      const orderId = Number(dto.object.metadata?.orderId)

      if (!orderId) return true

      await this.prisma.order.update({
        where: {
          id: orderId
        },
        data: {
          status: EnumOrderStatus.PAYED
        }
      })

      return true
    }

    return true
  }
}
