import { Injectable, NotFoundException } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/prisma.service';
import { CategoryDto } from './category.dto';
import { returnCategoryObject } from './return-category.object';


@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async byId(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id
      },
      select: returnCategoryObject
    })

    if(!category){
        throw new NotFoundException('Категория не найдена');
    }

    return category
  }

  async bySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: {
        slug
      },
      select: returnCategoryObject
    })

    if(!category){
        throw new NotFoundException('Категория не найдена');
    }

    return category
  }

  
  async getAllCategories() {
    return this.prisma.category.findMany({
      select: returnCategoryObject
    });
  }
  

  async createCategory(dto: CategoryDto) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: slugify(dto.name).toLowerCase()
      }
    });
  }

  async updateCategory(id: number, dto: CategoryDto) {
  
    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug: slugify(dto.name).toLowerCase(),
      }
    });
  }

  async deleteCategory(id: number) {
  
    return this.prisma.category.delete({
      where: { id }
    });
  }

}
