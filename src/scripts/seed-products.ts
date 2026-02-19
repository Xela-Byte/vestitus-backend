import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import {
  ClothingCategory,
  ClothingSize,
} from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';

const adjectives = [
  'Classic',
  'Modern',
  'Vintage',
  'Premium',
  'Elegant',
  'Casual',
  'Stylish',
  'Comfortable',
  'Luxury',
  'Essential',
  'Urban',
  'Trendy',
  'Smart',
  'Athletic',
  'Formal',
  'Street',
  'Designer',
  'Slim-Fit',
  'Oversized',
  'Fitted',
  'Relaxed',
  'Tailored',
  'Custom',
  'Signature',
  'Bold',
  'Minimalist',
  'Retro',
  'Contemporary',
  'Professional',
  'Sporty',
];

const materials = [
  'Cotton',
  'Denim',
  'Leather',
  'Wool',
  'Silk',
  'Polyester',
  'Linen',
  'Velvet',
  'Suede',
  'Canvas',
  'Jersey',
  'Chiffon',
  'Satin',
  'Tweed',
  'Fleece',
  'Cashmere',
  'Nylon',
  'Mesh',
  'Corduroy',
  'Knit',
];

const styles = [
  'Crew Neck',
  'V-Neck',
  'Button-Down',
  'Zip-Up',
  'Pullover',
  'Hooded',
  'Long Sleeve',
  'Short Sleeve',
  'Sleeveless',
  'Collared',
  'Turtleneck',
  'Off-Shoulder',
  'Cropped',
  'Midi',
  'Maxi',
  'Mini',
  'High-Waisted',
  'Low-Rise',
  'Bootcut',
  'Straight-Leg',
  'Tapered',
  'Wide-Leg',
  'A-Line',
  'Wrap',
  'Pleated',
];

const tags = [
  'summer',
  'winter',
  'spring',
  'fall',
  'casual',
  'formal',
  'party',
  'office',
  'weekend',
  'date-night',
  'outdoor',
  'sports',
  'gym',
  'yoga',
  'running',
  'hiking',
  'beach',
  'travel',
  'comfortable',
  'breathable',
  'waterproof',
  'wrinkle-free',
  'easy-care',
  'sustainable',
  'eco-friendly',
  'organic',
  'handmade',
  'limited-edition',
  'bestseller',
  'new-arrival',
  'sale',
  'trending',
  'unisex',
  'plus-size',
  'petite',
  'tall',
];

const categoryNames = {
  [ClothingCategory.SHIRT]: [
    'Shirt',
    'Oxford Shirt',
    'Dress Shirt',
    'Camp Shirt',
  ],
  [ClothingCategory.PANTS]: ['Pants', 'Trousers', 'Slacks', 'Chinos'],
  [ClothingCategory.DRESS]: ['Dress', 'Gown', 'Sundress', 'Evening Dress'],
  [ClothingCategory.JACKET]: ['Jacket', 'Blazer', 'Sport Coat', 'Windbreaker'],
  [ClothingCategory.SHOES]: [
    'Shoes',
    'Sneakers',
    'Boots',
    'Loafers',
    'Sandals',
  ],
  [ClothingCategory.ACCESSORY]: [
    'Belt',
    'Hat',
    'Scarf',
    'Gloves',
    'Tie',
    'Watch',
  ],
  [ClothingCategory.SWEATER]: ['Sweater', 'Cardigan', 'Jumper', 'Pullover'],
  [ClothingCategory.JEANS]: ['Jeans', 'Denim Jeans', 'Blue Jeans'],
  [ClothingCategory.SKIRT]: ['Skirt', 'Pencil Skirt', 'Flared Skirt'],
  [ClothingCategory.SHORTS]: ['Shorts', 'Bermuda Shorts', 'Cargo Shorts'],
  [ClothingCategory.COAT]: ['Coat', 'Trench Coat', 'Pea Coat', 'Overcoat'],
  [ClothingCategory.HOODIE]: ['Hoodie', 'Sweatshirt', 'Zip Hoodie'],
  [ClothingCategory.T_SHIRT]: ['T-Shirt', 'Tee', 'Graphic Tee', 'Basic Tee'],
  [ClothingCategory.BLOUSE]: ['Blouse', 'Top', 'Shell Top', 'Tunic'],
  [ClothingCategory.SUIT]: [
    'Suit',
    'Business Suit',
    '2-Piece Suit',
    '3-Piece Suit',
  ],
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateProductName(category: ClothingCategory): string {
  const adj = getRandomElement(adjectives);
  const mat = Math.random() > 0.5 ? getRandomElement(materials) : '';
  const style = Math.random() > 0.6 ? getRandomElement(styles) : '';
  const baseName = getRandomElement(categoryNames[category]);

  const parts = [adj, mat, style, baseName].filter(Boolean);
  return parts.join(' ');
}

function generatePrice(): number {
  const basePrice = Math.random() * 200 + 10; // $10 - $210
  return Math.round(basePrice * 100) / 100;
}

function generateDiscount(): number {
  const hasDiscount = Math.random() > 0.6; // 40% chance of discount
  if (!hasDiscount) return 0;
  return Math.floor(Math.random() * 50) + 5; // 5% - 54%
}

function generateSizes(): ClothingSize[] {
  const allSizes = Object.values(ClothingSize);
  const numSizes = Math.floor(Math.random() * 4) + 2; // 2-5 sizes
  return getRandomElements(allSizes, numSizes);
}

function generateTags(): string[] {
  const numTags = Math.floor(Math.random() * 5) + 2; // 2-6 tags
  return getRandomElements(tags, numTags);
}

async function seedProducts() {
  console.log('🌱 Starting product seeding...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);

  const categories = Object.values(ClothingCategory);
  const products: Array<{
    name: string;
    category: ClothingCategory;
    price: number;
    discountPercent: number;
    sizes: ClothingSize[];
    tags: string[];
  }> = [];

  console.log('📦 Generating 500 unique products...');

  const usedNames = new Set<string>();

  for (let i = 0; i < 500; i++) {
    const category = getRandomElement(categories);
    let name = generateProductName(category);

    // Ensure uniqueness by adding a number if name exists
    let counter = 1;
    const originalName = name;
    while (usedNames.has(name)) {
      name = `${originalName} #${counter}`;
      counter++;
    }
    usedNames.add(name);

    const product = {
      name,
      category,
      price: generatePrice(),
      discountPercent: generateDiscount(),
      sizes: generateSizes(),
      tags: generateTags(),
    };

    products.push(product);

    if ((i + 1) % 100 === 0) {
      console.log(`✓ Generated ${i + 1}/500 products`);
    }
  }

  console.log('💾 Saving products to database...');

  let savedCount = 0;
  for (const product of products) {
    try {
      await productsService.create(product);
      savedCount++;
      if (savedCount % 100 === 0) {
        console.log(`✓ Saved ${savedCount}/500 products`);
      }
    } catch (error) {
      console.error(`Failed to save product: ${product.name}`, error.message);
    }
  }

  console.log(`\n✅ Successfully seeded ${savedCount} products!`);
  console.log('\n📊 Summary:');
  console.log(`   Total products: ${savedCount}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Price range: $10 - $210`);
  console.log(`   Discount range: 0% - 54%`);

  await app.close();
  process.exit(0);
}

seedProducts().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
