import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ClothingCategory {
  SHIRT = 'shirt',
  PANTS = 'pants',
  DRESS = 'dress',
  JACKET = 'jacket',
  SHOES = 'shoes',
  ACCESSORY = 'accessory',
  SWEATER = 'sweater',
  JEANS = 'jeans',
  SKIRT = 'skirt',
  SHORTS = 'shorts',
  COAT = 'coat',
  HOODIE = 'hoodie',
  T_SHIRT = 't-shirt',
  BLOUSE = 'blouse',
  SUIT = 'suit',
}

export enum ClothingSize {
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL',
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ClothingCategory })
  category: ClothingCategory;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: false, min: 0, max: 100, default: 0 })
  discountPercent: number;

  @Prop({ required: true, type: [String], enum: ClothingSize })
  sizes: ClothingSize[];

  @Prop({ required: false, type: [String], default: [] })
  tags: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
