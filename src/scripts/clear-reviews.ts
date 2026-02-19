import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Review, ReviewDocument } from '../reviews/entities/review.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const reviewModel = app.get<Model<ReviewDocument>>(
    getModelToken(Review.name),
  );

  console.log('Clearing all reviews from database...');

  try {
    const result = await reviewModel.deleteMany({}).exec();
    console.log(`✅ Cleared ${result.deletedCount} reviews successfully!`);
  } catch (error) {
    console.error('Error clearing reviews:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
