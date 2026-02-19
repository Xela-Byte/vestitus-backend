import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Product, ProductDocument } from '../products/entities/product.entity';
import { Review, ReviewDocument } from '../reviews/entities/review.entity';
import { User, UserDocument } from '../users/entities/user.entity';

const reviewComments = {
  5: [
    'Absolutely love this! Best purchase ever!',
    'Perfect fit and amazing quality. Highly recommend!',
    'Exceeded my expectations! Will buy again.',
    'Outstanding product! Worth every penny.',
    'Excellent quality and fast delivery. Very satisfied!',
    'This is exactly what I was looking for. Perfect!',
    'Amazing product! Fits perfectly and looks great.',
    'Best quality in this price range. Very happy!',
    'Superb! Would definitely recommend to everyone.',
    'Top-notch quality! Extremely satisfied with this purchase.',
  ],
  4: [
    'Great product! Minor issues but overall very good.',
    'Good quality, exactly as described.',
    'Nice product, fits well. Would buy again.',
    'Very good! Just wish it came in more colors.',
    'Solid purchase. Good value for money.',
    'Pretty good! Comfortable and stylish.',
    'Good quality material. Happy with the purchase.',
    'Nice product overall. Delivery was quick.',
    'Good fit and quality. Slightly pricey but worth it.',
    'Satisfied with the purchase. Minor sizing issue.',
  ],
  3: [
    "It's okay. Nothing special but does the job.",
    'Average quality. Expected better for the price.',
    'Decent product but not exactly as pictured.',
    "It's fine. Fits okay but color is slightly off.",
    'Acceptable. Neither impressed nor disappointed.',
    'Okay quality. Might return if I find something better.',
    'Fair product. Fit is a bit loose.',
    'Not bad, not great. Just average.',
    'It works but quality could be better.',
    'Mediocre. Expected more based on reviews.',
  ],
  2: [
    'Not great. Quality is poor for the price.',
    'Disappointed. Material feels cheap.',
    'Sizing is way off. Had to return it.',
    'Below expectations. Color faded after first wash.',
    'Not worth the money. Quality is lacking.',
    'Poor quality. Stitching came loose quickly.',
    'Not as described. Very disappointed.',
    'Bad fit. Too tight even after ordering size up.',
    "Quality is questionable. Wouldn't recommend.",
    'Unsatisfied. Material is thin and cheap feeling.',
  ],
  1: [
    'Terrible quality. Complete waste of money.',
    'Worst purchase ever! Do not buy.',
    'Awful! Fell apart after one wear.',
    'Horrible! Nothing like the pictures.',
    'Very poor quality. Requesting refund.',
    'Extremely disappointed. Cheap material.',
    'Do not buy! Total rip-off.',
    'Awful fit and quality. Very unhappy.',
    'Terrible product. Broke immediately.',
    'Worst quality ever. Avoid at all costs!',
  ],
};

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productModel = app.get<Model<ProductDocument>>(
    getModelToken(Product.name),
  );
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const reviewModel = app.get<Model<ReviewDocument>>(
    getModelToken(Review.name),
  );

  console.log('Starting review seeding...');

  try {
    // Fetch all products and users
    const products = await productModel.find().exec();
    const users = await userModel.find().exec();

    if (products.length === 0) {
      console.error('❌ No products found! Please seed products first.');
      await app.close();
      return;
    }

    if (users.length === 0) {
      console.error('❌ No users found! Please seed users first.');
      await app.close();
      return;
    }

    console.log(`Found ${products.length} products and ${users.length} users`);
    console.log('Generating 1000 reviews...\n');

    const reviews: Array<{
      productId: any;
      addedBy: string;
      role: string;
      stars: number;
      comment: string;
    }> = [];

    for (let i = 0; i < 1000; i++) {
      // Random product
      const randomProduct =
        products[Math.floor(Math.random() * products.length)];

      // 20% chance of anonymous review
      const isAnonymous = Math.random() < 0.2;

      let addedBy: string;
      let role: string;

      if (isAnonymous) {
        addedBy = 'anonymous';
        role = 'anonymous';
      } else {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        addedBy = randomUser._id.toString();
        role = randomUser.role;
      }

      // Generate rating (weighted towards higher ratings for realism)
      const ratingWeights = [0.05, 0.1, 0.15, 0.3, 0.4]; // 1-5 stars
      const random = Math.random();
      let stars = 5;
      let cumulative = 0;
      for (let j = 0; j < ratingWeights.length; j++) {
        cumulative += ratingWeights[j];
        if (random < cumulative) {
          stars = j + 1;
          break;
        }
      }

      // Get random comment based on rating
      const comments = reviewComments[stars];
      const comment = comments[Math.floor(Math.random() * comments.length)];

      reviews.push({
        productId: randomProduct._id,
        addedBy,
        role,
        stars,
        comment,
      });

      // Log progress every 100 reviews
      if ((i + 1) % 100 === 0) {
        console.log(`Generated ${i + 1}/1000 reviews...`);
      }
    }

    // Insert all reviews
    await reviewModel.insertMany(reviews);

    console.log('\n✅ Review seeding completed successfully!');
    console.log(`Total reviews created: ${reviews.length}`);

    // Calculate statistics
    const anonymousCount = reviews.filter((r) => r.role === 'anonymous').length;
    const authenticatedCount = reviews.length - anonymousCount;
    const avgRating = (
      reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
    ).toFixed(2);

    console.log('\nStatistics:');
    console.log(`- Authenticated reviews: ${authenticatedCount}`);
    console.log(`- Anonymous reviews: ${anonymousCount}`);
    console.log(`- Average rating: ${avgRating} stars`);
  } catch (error) {
    console.error('Error seeding reviews:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
