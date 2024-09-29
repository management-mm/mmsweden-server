import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { Product } from 'src/schemas/product.schema';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async getAllProducts(
    @Query()
    query: ExpressQuery
  ): Promise<{products: Product[], total: number}> {
    return this.productService.findAll(query);
  }

  @Get(':id')
  async getProduct(
    @Param('id')
    id: string
  ): Promise<Product> {
    return this.productService.findById(id);
  }

  @Get(':id/recommended-products')
  async getRecommendedProducts(
    @Param('id')
    id: string
  ): Promise<Product[]> {
    return this.productService.findRecommendedProductsById(id)
    }

  @Post()
  @UseGuards(AuthGuard())
  async createProduct(
    @Query()
    query: ExpressQuery,
    @Body()
    product: CreateProductDto
  ): Promise<Product> {
    return this.productService.create(product, query);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async updateProduct(
    @Param('id')
    id: string,
    @Body()
    product: UpdateProductDto
  ): Promise<Product> {
    return this.productService.updateById(id, product);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteProduct(
    @Param('id')
    id: string
  ): Promise<Product> {
    return this.productService.deleteById(id);
  }
}
