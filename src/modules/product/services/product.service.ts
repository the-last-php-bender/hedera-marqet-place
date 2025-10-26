// product.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Product } from '../schema/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductNafdacService } from '../services/product-nafdac.service';
import { ConfigService } from '@nestjs/config';
import { paginate, PaginatedResult } from 'src/common/utils/pagination.utils';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
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
}
