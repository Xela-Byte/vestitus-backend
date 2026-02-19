import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Product, ProductDocument } from '../products/entities/product.entity';

async function clearProducts() {
  console.log('🧹 Starting database cleanup...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const productModel = app.get<Model<ProductDocument>>(
    getModelToken(Product.name),
  );

  const count = await productModel.countDocuments();
  console.log(`📊 Found ${count} products in database`);

  if (count === 0) {
    console.log('✅ Database is already empty');
    await app.close();
    process.exit(0);
  }

  console.log('🗑️  Deleting all products...');
  const result = await productModel.deleteMany({});
  console.log(`✅ Successfully deleted ${result.deletedCount} products`);

  await app.close();
  process.exit(0);
}

clearProducts().catch((error) => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});
