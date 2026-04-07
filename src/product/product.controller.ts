import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { OpenAIService } from 'src/openai/openai.service';
import { Product } from 'src/schemas/product.schema';
import { ProductSitemapItem } from 'src/types/product-sitemap-item.type';

import { CreateProductDto } from './dto/create-product.dto';
import { GenerateDescriptionPreviewDto } from './dto/generate-desc-prev-dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(
    private productService: ProductService,
    private readonly openAIService: OpenAIService
  ) {}

  @Get('sitemap')
  async getProductsForSitemap(): Promise<ProductSitemapItem[]> {
    return this.productService.getProductsForSitemap();
  }

  @Get()
  async getAllProducts(
    @Query()
    query: ExpressQuery
  ): Promise<{ products: Product[]; total: number }> {
    return this.productService.findAll(query);
  }

  @Get('by-slug/:slug')
  getBySlug(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  @Get(':slug/recommended-products')
  async getRecommendedProducts(
    @Param('slug') slug: string
  ): Promise<Product[]> {
    return this.productService.findRecommendedProductsBySlug(slug);
  }

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
    @Param('id') id: string,
    @Query() query: ExpressQuery,
    @Body() product: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.productService.updateById(id, query, product, files);
  }

  @Post('description/ai')
  @UseGuards(AuthGuard())
  async regenerateDescriptionWithAI(
    @Body() dto: GenerateDescriptionPreviewDto
  ) {
    return this.openAIService.generateProductDescription(dto);
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
