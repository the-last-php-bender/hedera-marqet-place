import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, Query, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductService } from '../services/product.service';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { CreateReviewDto } from '../dto/create-review.dto';
import { Types } from 'mongoose';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a product with a thumbnail',
    type: CreateProductDto, // 👈 Use your DTO here
  })
  @ApiCreatedResponse({ type: ProductResponseDto })
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
      }),
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: CreateProductDto) {
    return this.productService.create({
      ...body,
      thumbnail: file?.path,
    });
  }

  @Get()
  @ApiOkResponse({ type: [ProductResponseDto] })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.productService.findAll(query);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Rate and review a product' })
  @ApiBody({ type: CreateReviewDto })
  rateProduct(
    @Param('id') productId: string,
    @Body() body: CreateReviewDto
  ) {
    return this.productService.rateAndReview(
      new Types.ObjectId().toString(),
      productId,
      body
    );
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get all reviews for a product' })
  async getProductReviews(
    @Param('id') productId: string,
    @Query() params: PaginationQueryDto
  ) {
    return this.productService.getProductReviews(productId, params);
  }

@Get('reviews/verify/:reviewId')
async verifyProductReview(
  @Param('reviewId') reviewId: string
) {
  return this.productService.verifyReview(reviewId);
}
}
