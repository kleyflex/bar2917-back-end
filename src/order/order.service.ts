import { Injectable } from '@nestjs/common';
import { EnumOrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { productReturnObject } from 'src/product/return-product.object';
import * as YooKassa from 'yookassa';
import { OrderDto } from './order.dto';
import { PaymentStatusDto } from './payment-status.dto';

const yooKassa = new YooKassa({
  shopId: process.env['SHOP_ID'],
  secretKey: process.env['PAYMENT_TOKEN']
})

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

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
  

  async placeOrder(dto: OrderDto, userId: number, locationId: number) {
    const deliveryPrice = 100;

    const total = dto.items.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0) + deliveryPrice;

    const order = await this.prisma.order.create({
      data: {
        status: dto.status,
        address: dto.address,
        commentary: dto.commentary,
        deliveryDate: dto.deliveryDate,
        deliveryTime: dto.deliveryTime,
        total,
        location: {
          connect: {
            id: locationId
          }
        },
        items: {
          create: dto.items
        },
        user: {
          connect: {
            id: userId
          }
        }
      }
    })

    const payment = await yooKassa.createPayment({
      amount: {
        value: total.toFixed(2),
        currency: 'RUB'
      },
      payment_method_data: {
        type: 'bank_card'
      },
      confirmation: {
        type:'redirect',
        return_url: 'http://31.128.41.46:3000/thanks'
      },
      description: `Заказ #${order.id}`,
      metadata: {
        orderId: String(order.id)
      }
    })

    return payment
}

  // Endpoint закрыт OrdersEnabledGuard, пока доставка выключена.
  // TODO перед включением доставки: не доверять телу webhook'а —
  // 1) запросить платёж обратно у YooKassa по dto.object.id и сверить статус/сумму/metadata.orderId;
  // 2) отфильтровать запросы по официальным IP-диапазонам YooKassa;
  // 3) переводить заказ в PAYED только по данным, полученным от YooKassa, а не из тела запроса.
  async updateStatus(dto: PaymentStatusDto){
    if (dto.event === 'payment.waiting_for_capture') {
      const payment = await yooKassa.capturePayment(dto.object.id)

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
