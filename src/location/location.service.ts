import { Injectable, NotFoundException } from '@nestjs/common';
import { productReturnObject } from 'src/product/return-product.object';
import { PrismaService } from '../prisma.service';
import { LocationDto } from './dto/location.dto';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    return this.prisma.location.findMany({
      where: {
        isActive: true
      },
      include: {
        products: {
          include: {
            product: {
              select: productReturnObject
            }
          }
        }
      }
    });
  }

  async getById(id: number) {
    return this.prisma.location.findUnique({
      where: { id: id },
      include: {
        products: {
          include: {
            product: {
                select: productReturnObject
            }
          }
        }
      }
    });
  }

  async createLocation(dto: LocationDto) {
    return this.prisma.location.create({
      data: {
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
        isDefault: dto.isDefault || false
      }
    });
  }

  async updateLocation(id: number, dto: LocationDto) {
    return this.prisma.location.update({
      where: { id },
      data: {
        name: dto.name,
        address: dto.address,
        phone: dto.phone,
        isDefault: dto.isDefault
      }
    });
  }

  async deleteLocation(id: number) {
    return this.prisma.location.delete({
      where: { id }
    });
  }

  async getPhoneByAddress(address: string) {
    const location = await this.prisma.location.findUnique({
      where: { address },
      select: {
        phone: true,
        name: true
      }
    });

    if (!location) {
      throw new NotFoundException('Локация с таким адресом не найдена');
    }

    return location;
  }
} 