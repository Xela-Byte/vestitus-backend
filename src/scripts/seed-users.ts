import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';

const firstNames = [
  'John',
  'Jane',
  'Michael',
  'Sarah',
  'David',
  'Emily',
  'Robert',
  'Lisa',
  'James',
  'Maria',
  'William',
  'Jennifer',
  'Richard',
  'Linda',
  'Thomas',
  'Patricia',
  'Charles',
  'Barbara',
  'Daniel',
  'Susan',
];

const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  console.log('Starting user seeding...');

  try {
    const users: Array<{
      fullName: string;
      email: string;
      password: string;
      role: string;
    }> = [];

    // 1. Create admin user with specified credentials
    const adminPassword = await bcrypt.hash('123Xela!', 10);
    users.push({
      fullName: 'Xela Oladipupo',
      email: 'xelaoladipupo@gmail.com',
      password: adminPassword,
      role: 'admin',
    });

    // 2. Generate 9 regular users
    const usedEmails = new Set(['xelaoladipupo@gmail.com']);

    for (let i = 0; i < 9; i++) {
      const firstName =
        firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;

      // Generate unique email
      let email: string;
      do {
        const randomNum = Math.floor(Math.random() * 10000);
        email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@example.com`;
      } while (usedEmails.has(email));
      usedEmails.add(email);

      // Generate password (we'll use a default for seeding)
      const password = await bcrypt.hash('Password123!', 10);

      users.push({
        fullName,
        email,
        password,
        role: 'user',
      });
    }

    // Save all users
    for (const userData of users) {
      try {
        await usersService.create(userData);
        console.log(`✓ Created ${userData.role}: ${userData.email}`);
      } catch (error) {
        console.log(`✗ Failed to create ${userData.email}:`, error.message);
      }
    }

    console.log('\n✅ User seeding completed successfully!');
    console.log(`Total users created: ${users.length}`);
    console.log('\nAdmin credentials:');
    console.log('Email: xelaoladipupo@gmail.com');
    console.log('Password: 123Xela!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
