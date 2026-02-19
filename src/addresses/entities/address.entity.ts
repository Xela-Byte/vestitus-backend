import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AddressDocument = Address & Document;

export enum AddressNickname {
  HOME = 'home',
  WORK = 'work',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Address {
  @Prop({ required: true, enum: AddressNickname })
  nickname: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ default: false })
  isDefault: boolean;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
