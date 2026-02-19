import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { paginate } from 'src/common/utils/pagination.helper';
import { Review, ReviewDocument } from 'src/reviews/entities/review.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductsDto, PriceSortOrder } from './dto/filter-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    // Check if product with same name and category already exists
    const existingProduct = await this.productModel.findOne({
      name: createProductDto.name,
      category: createProductDto.category,
    });

    if (existingProduct) {
      throw new ConflictException(
        `Product "${createProductDto.name}" in category "${createProductDto.category}" already exists`,
      );
    }

    const newProduct = new this.productModel(createProductDto);
    return newProduct.save();
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<ProductDocument>> {
    return paginate(this.productModel, paginationQuery);
  }

  async findAllWithFilters(
    filterDto: FilterProductsDto,
  ): Promise<PaginatedResult<any>> {
    const {
      category,
      relevance,
      priceSort,
      minPrice,
      maxPrice,
      exactPrice,
      size,
      page = 1,
      limit = 10,
    } = filterDto;

    // Build match stage for filtering
    const matchStage: any = {};

    // Category filter
    if (category) {
      matchStage.category = category;
    }

    // Price filters
    if (exactPrice !== undefined) {
      matchStage.price = exactPrice;
    } else {
      if (minPrice !== undefined || maxPrice !== undefined) {
        matchStage.price = {};
        if (minPrice !== undefined) {
          matchStage.price.$gte = minPrice;
        }
        if (maxPrice !== undefined) {
          matchStage.price.$lte = maxPrice;
        }
      }
    }

    // Size filter - check if any of the provided sizes exist in product sizes array
    if (size) {
      const sizesArray = size.split(',').map((s) => s.trim());
      matchStage.sizes = { $in: sizesArray };
    }

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage for basic filters
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Lookup reviews for relevance calculation
    pipeline.push({
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'productId',
        as: 'reviews',
      },
    });

    // Add fields for review metrics
    pipeline.push({
      $addFields: {
        reviewCount: { $size: '$reviews' },
        avgRating: {
          $cond: {
            if: { $gt: [{ $size: '$reviews' }, 0] },
            then: { $avg: '$reviews.rating' },
            else: 0,
          },
        },
        relevanceScore: {
          $multiply: [
            {
              $cond: {
                if: { $gt: [{ $size: '$reviews' }, 0] },
                then: { $avg: '$reviews.rating' },
                else: 0,
              },
            },
            { $size: '$reviews' },
          ],
        },
      },
    });

    // Remove reviews array from output (we only need metrics)
    pipeline.push({
      $project: {
        reviews: 0,
      },
    });

    // Sort stage
    const sortStage: any = {};
    if (relevance) {
      // Sort by relevance score (avgRating * reviewCount) in descending order
      sortStage.relevanceScore = -1;
    } else if (priceSort) {
      // Sort by price
      sortStage.price = priceSort === PriceSortOrder.LOW_TO_HIGH ? 1 : -1;
    } else {
      // Default sort by creation date
      sortStage.createdAt = -1;
    }
    pipeline.push({ $sort: sortStage });

    // Count total documents (before pagination)
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.productModel.aggregate(countPipeline).exec();
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Execute aggregation
    const data = await this.productModel.aggregate(pipeline).exec();

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductDocument> {
    // Check if product exists
    const existingProduct = await this.productModel.findById(id).exec();

    if (!existingProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // If name or category is being updated, check for duplicates
    if (updateProductDto.name || updateProductDto.category) {
      const nameToCheck = updateProductDto.name || existingProduct.name;
      const categoryToCheck =
        updateProductDto.category || existingProduct.category;

      const duplicateProduct = await this.productModel.findOne({
        name: nameToCheck,
        category: categoryToCheck,
        _id: { $ne: id }, // Exclude current product
      });

      if (duplicateProduct) {
        throw new ConflictException(
          `Product "${nameToCheck}" in category "${categoryToCheck}" already exists`,
        );
      }
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();

    return updatedProduct!;
  }

  async remove(id: string): Promise<ProductDocument> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id).exec();

    if (!deletedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return deletedProduct;
  }

  async findByCategory(
    category: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<ProductDocument>> {
    return paginate(this.productModel, paginationQuery, { category });
  }
}
