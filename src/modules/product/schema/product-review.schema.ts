import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ProductReview extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  review: string;

  @Prop()
  hederaHash: string;

  @Prop()
  hederaTxId: string;

  @Prop({ default: 0 })
  rewardTokens: number;
}

export const ProductReviewSchema = SchemaFactory.createForClass(ProductReview);
