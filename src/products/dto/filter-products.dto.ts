import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum PriceSortOrder {
  LOW_TO_HIGH = 'low-to-high',
  HIGH_TO_LOW = 'high-to-low',
}

export class FilterProductsDto {
  @ApiPropertyOptional({
    description: 'Filter by product category',
    example: 'T-Shirts',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Sort by relevance (highly reviewed products first)',
    example: true,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  relevance?: boolean;

  @ApiPropertyOptional({
    description: 'Sort by price order',
    enum: PriceSortOrder,
    example: PriceSortOrder.LOW_TO_HIGH,
  })
  @IsOptional()
  @IsEnum(PriceSortOrder)
  priceSort?: PriceSortOrder;

  @ApiPropertyOptional({
    description: 'Minimum price',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Specific price',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  exactPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter by size (can be comma-separated for multiple sizes)',
    example: 'M,L',
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
