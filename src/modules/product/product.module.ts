import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schema/product.schema';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { ProductNafdacService } from './services/product-nafdac.service';
import { HederaService } from './services/product-hedera.service';
import { ProductReview, ProductReviewSchema } from './schema/product-review.schema';


@Module({
  imports: [MongooseModule.forFeature([
    { name: Product.name, schema: ProductSchema },
    { name : ProductReview.name, schema: ProductReviewSchema}
  ])],
  controllers: [ProductController],
  providers: [ProductService,ProductNafdacService, HederaService],
})
export class ProductModule {}
