import { Controller, Get, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductService } from '../services/product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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
  async findAll() {
    return this.productService.findAll();
  }
}
