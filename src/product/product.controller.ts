import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
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
  ): Promise<{ products: Product[]; total: number }> {
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
    return this.productService.findRecommendedProductsById(id);
  }

  // @Put(':id/photos')
  // @UseInterceptors(FilesInterceptor('photos'))
  // @UseGuards(AuthGuard())
  // async updatePhotos(
  //   @Param('id')
  //   id: string,
  //   @UploadedFiles()
  //   files: Express.Multer.File[]
  // ): Promise<string[]> {
  //   return this.productService.updatePhotos(id, files);
  // }

  @Post()
  @UseGuards(AuthGuard())
  @UseInterceptors(FilesInterceptor('photos'))
  async createProduct(
    @Query()
    query: ExpressQuery,
    @Body()
    product: CreateProductDto,
    @UploadedFiles()
    files: Express.Multer.File[]
  ): Promise<Product> {
    return this.productService.create(product, query, files);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  @UseInterceptors(FilesInterceptor('photos'))
  async updateProduct(
    @Param('id')
    id: string,
    @Query()
    query: ExpressQuery,
    @Body()
    product: UpdateProductDto,
    @UploadedFiles()
    files: Express.Multer.File[]
  ): Promise<Product> {
    return this.productService.updateById(id, query, product, files);
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
