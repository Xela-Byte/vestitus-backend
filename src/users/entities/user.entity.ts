import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({ default: 'user' })
  role: string;

  // Social Authentication Fields
  @Prop({ required: false })
  googleId: string;

  @Prop({ required: false })
  appleId: string;

  @Prop({ default: 'local' }) // 'local', 'google', 'apple'
  authProvider: string;

  @Prop({ required: false })
  profilePicture: string;

  @Prop({ type: [String], default: [] })
  passwordHistory: string[];

  @Prop({ required: false })
  resetOtp: string;

  @Prop({ required: false })
  resetOtpExpiry: Date;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Product' }],
    default: [],
  })
  favourites: string[];

  @Prop({ required: false })
  dateOfBirth: Date;

  @Prop({ required: false, enum: Gender })
  gender: string;

  @Prop({ required: false })
  phoneNumber: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
