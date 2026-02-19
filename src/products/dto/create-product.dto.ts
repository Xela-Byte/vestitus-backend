import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ClothingCategory, ClothingSize } from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({
    example: 'Classic Cotton T-Shirt',
    description: 'Product name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 't-shirt',
    description: 'Clothing category',
    enum: ClothingCategory,
  })
  @IsEnum(ClothingCategory)
  @IsNotEmpty()
  category: ClothingCategory;

  @ApiProperty({
    example: 29.99,
    description: 'Product price',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: 15,
    description: 'Discount percentage (0-100)',
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discountPercent?: number;

  @ApiProperty({
    example: ['M', 'L', 'XL'],
    description: 'Available sizes',
    enum: ClothingSize,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(ClothingSize, { each: true })
  sizes: ClothingSize[];

  @ApiProperty({
    example: ['summer', 'casual', 'cotton'],
    description: 'Product tags',
    required: false,
    isArray: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
