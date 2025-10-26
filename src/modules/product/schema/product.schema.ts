import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop()
  thumbnail: string;

  @Prop()
  video3D: string;

  @Prop({default:false})
  verified:boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
