import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  productId: string;

  @Prop({ required: true })
  addedBy: string; // "anonymous" | user_id | admin_id

  @Prop({ required: true, enum: ['anonymous', 'user', 'admin'] })
  role: string;

  @Prop({ required: true, min: 1, max: 5 })
  stars: number;

  @Prop({ required: true })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
