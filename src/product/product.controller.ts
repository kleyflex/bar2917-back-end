import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { GetAllProductDto } from './dto/get-all.product.dto';
import { ProductDto } from './dto/product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAll(@Query() queryDto: GetAllProductDto) {
    return this.productService.getAll(queryDto)
  }

  @Get('by-slug/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    return this.productService.bySlug(slug)
  }

  @Get('similar/:id')
  async getSimilar(@Param('id') id: string) {
    return this.productService.getSimilar(+id)
  }

  @Get('by-category/:categorySlug')
  async getProductByCategory(@Param('categorySlug') categorySlug: string) {
    return this.productService.byCategory(categorySlug)
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.productService.byId(+id);
  }

  @HttpCode(200)
  @Auth('admin')
  @Post()
  async createProduct(@Body() dto: CreateProductDto){
    return this.productService.create(dto)
  }

  @HttpCode(200)
  @Put(':id')
  @Auth('admin')
  async updateProduct(@Param('id') id: string, @Body() dto: ProductDto) {
    return this.productService.update(+id, dto)
  }

  @HttpCode(200)
  @Delete(':id')
  @Auth('admin')
  async deleteProduct(@Param('id') id: string) {
    return this.productService.delete(+id)
  }

  @Get('price/:productId/:locationId')
  async getProductPrice(
    @Param('productId') productId: string,
    @Param('locationId') locationId: string
  ) {
    return this.productService.getProductPrice(+productId, +locationId);
  }
}
