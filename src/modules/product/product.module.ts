import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schema/product.schema';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { ProductNafdacService } from './services/product-nafdac.service';


@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
  controllers: [ProductController],
  providers: [ProductService,ProductNafdacService],
})
export class ProductModule {}
