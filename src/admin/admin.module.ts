import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [AuthModule, UsersModule, ProductsModule],
  controllers: [AdminController],
})
export class AdminModule {}
