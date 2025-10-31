// product.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';
import { Product } from '../schema/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductNafdacService } from '../services/product-nafdac.service';
import { ConfigService } from '@nestjs/config';
import { paginate, PaginatedResult } from 'src/common/utils/pagination.utils';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';
import { ProductReview } from '../schema/product-review.schema';
import { HederaService } from './product-hedera.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { PublishReviewPayload } from '../interface/hedera.interface';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(ProductReview.name) private reviewModel: Model<ProductReview>,
    private readonly hedera: HederaService,
    private readonly nafdacService: ProductNafdacService,
    private configService: ConfigService
  ) { }

  async create(data: CreateProductDto): Promise<Product> {
    const { nafdacNo } = data;
    const verifyRes = await this.nafdacService.verify(String(nafdacNo));

    if (!verifyRes.success) {
      throw new BadRequestException('This product does not have a verified nafDac No.');
    }

    const created = await this.productModel.create({
      ...data,
      thumbnail: `${this.configService.get<string>('app.base_url')}/${data.thumbnail}`,
      verified:verifyRes.success,
    });

    return created;
  }

  async findAll(params: PaginationQueryDto): Promise<PaginatedResult<Product>> {
    const filter = {};

    const result = await paginate<Product>({
      model: this.productModel,
      filter,
      params,
      sort: { createdAt: -1 },
    });

    return result;
  }

    async rateAndReview(userId: string, productId: string, dto: CreateReviewDto) {
      const {rating, review}= dto
    if (rating < 1 || rating > 5) throw new BadRequestException('Invalid rating');

    const payload : PublishReviewPayload= { userId, productId, rating, review };
    const { hash, txId } = await this.hedera.publish(payload);

    return await this.reviewModel.create({
      userId,
      productId: new Types.ObjectId(productId),
      rating,
      review,
      hederaHash: hash,
      hederaTxId: txId,
      rewardTokens: 0
    });
  }

async getProductReviews(productId: string, params: PaginationQueryDto) {
  const filter = { productId: new Types.ObjectId(productId)};

  const result = await paginate({
    model: this.reviewModel,
    filter,
    params,
    sort: { createdAt: -1 }
  });

  return result;
}

}
