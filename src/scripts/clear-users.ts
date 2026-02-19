import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { User, UserDocument } from '../users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

  console.log('Clearing all users from database...');

  try {
    const result = await userModel.deleteMany({}).exec();
    console.log(`✅ Cleared ${result.deletedCount} users successfully!`);
  } catch (error) {
    console.error('Error clearing users:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
