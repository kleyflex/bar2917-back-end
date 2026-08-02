import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { EnumProductSort, GetAllProductDto } from './dto/get-all.product.dto';
import { ProductDto } from './dto/product.dto';
import { productReturnObject, productReturnObjectFullest } from './return-product.object';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}


  async getAll(dto: GetAllProductDto) {
    const { sort, searchTerm, locationId, page, perPage } = dto;

    const location = await this.prisma.location.findUnique({
      where: { id: locationId }
    });

    if (!location) {
      throw new NotFoundException('Локация не найдена');
    }

    const where: Prisma.ProductWhereInput = {
      locations: {
        some: {
          locationId // Только товары, доступные в этой локации
        }
      },
      ...(searchTerm ? {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      } : {})
    };

    const products = await this.prisma.product.findMany({
      where,
      select: {
        ...productReturnObject,
        locations: {
          where: { locationId },
          select: {
            price: true,
            isAvailable: true,
            location: {
              select: {
                id: true,
                name: true,
                address: true
              }
            }
          }
        }
      }
    });

    // Сортировка в памяти — приемлемо при текущем объёме каталога (~110 товаров);
    // при заметном росте перенести сортировку по цене в SQL
    if (sort === EnumProductSort.LOW_PRICE) {
      products.sort((a, b) => (a.locations[0]?.price || 0) - (b.locations[0]?.price || 0));
    } else if (sort === EnumProductSort.HIGH_PRICE) {
      products.sort((a, b) => (b.locations[0]?.price || 0) - (a.locations[0]?.price || 0));
    } else if (sort === EnumProductSort.NEWEST) {
      products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else {
      products.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    // Пагинация после сортировки; length — всегда полное число товаров под фильтром
    const length = products.length;
    const pagedProducts = perPage
      ? products.slice(((page ?? 1) - 1) * perPage, (page ?? 1) * perPage)
      : products;

    return {
      products: pagedProducts,
      length
    }
  }

  async byId(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id
      },
      select: productReturnObjectFullest
    })

    if(!product){
        throw new NotFoundException('Товар не найден');
    }

    return product
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        slug
      },
      select: productReturnObjectFullest
    })

    if(!product){
        throw new NotFoundException('Товар не найден');
    }

    return product
  }

  async byCategory(categorySlug: string) {
    const products = await this.prisma.product.findMany({
      where: {
        category: {
          slug: categorySlug
        }
      },
      select: productReturnObjectFullest
    })

    if(!products){
      throw new NotFoundException('Товары не найдены');
  }

  return products
  }

  async getSimilar(id: number) {
    const currentProduct = await this.byId(id)

    const products = await this.prisma.product.findMany({
      where: {
        category: {
          name: currentProduct.category.name
        },
        NOT: {
          id: currentProduct.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: productReturnObject
    })

    return products
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId }
    });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: slugify(dto.name).toLowerCase(),
        description: dto.description ?? '',
        image: dto.image ?? '',
        weight: dto.weight ?? 0,
        category: {
          connect: { id: dto.categoryId }
        }
      }
    });
  }

  async update(id: number, dto: ProductDto) {
    const { name, image, description, categoryId, items, weight, isActive } = dto;

    return this.prisma.product.update({
      where: { id },
      data: {
        description,
        image,
        name,
        weight,
        isActive,
        slug: slugify(name).toLowerCase(),
        category: {
          connect: {
            id: categoryId
          }
        },
        locations: {
          // upsert вместо create: повторное сохранение не падает на unique(productId, locationId)
          upsert: items.map(item => ({
            where: {
              productId_locationId: {
                productId: id,
                locationId: item.locationId
              }
            },
            update: { price: item.price },
            create: {
              price: item.price,
              locationId: item.locationId
            }
          }))
        }
      }
    });
  }

  async delete(id: number) {
    // Связанные цены по локациям удаляются в той же транзакции
    return this.prisma.$transaction(async tx => {
      await tx.productLocation.deleteMany({ where: { productId: id } });
      return tx.product.delete({ where: { id } });
    });
  }

  async getProductPrice(productId: number, locationId: number) {
    const productLocation = await this.prisma.productLocation.findUnique({
      where: {
        productId_locationId: {
          productId,
          locationId
        }
      },
      select: {
        price: true,
        isAvailable: true
      }
    });

    if (!productLocation) {
      throw new NotFoundException('Цена для данного продукта в указанной локации не найдена');
    }

    if (!productLocation.isAvailable) {
      throw new NotFoundException('Продукт недоступен в данной локации');
    }

    return productLocation.price;
  }

}
