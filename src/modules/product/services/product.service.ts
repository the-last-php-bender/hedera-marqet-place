// product.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Product } from '../schema/product.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { ProductNafdacService } from '../services/product-nafdac.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private readonly nafdacService: ProductNafdacService,
  ) { }

  /**
   * Create product. If nafdacNo is provided, verify it and attach verification data.
   */
  async create(data: CreateProductDto & { thumbnail?: string }): Promise<Product> {
    const { nafdacNo } = data;
    let verified = false;

    if (nafdacNo) {
      const verifyRes = await this.nafdacService.verify(String(nafdacNo));

      if (!verifyRes.success) {
        throw new BadRequestException(verifyRes.message);
      }

      verified = verifyRes.success
    } else {
      this.logger.debug('No nafdacNo provided — skipping verification');
    }

    const created = await this.productModel.create({
      ...data,
      verified,
    });

    return created;
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().sort({ createdAt: -1 }).exec();
  }
}
