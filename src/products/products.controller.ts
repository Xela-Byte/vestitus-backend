import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterProductsDto } from './dto/filter-products.dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all products with advanced filtering',
    description:
      'Filter products by category, relevance (based on reviews), price range/sorting, and size. All filters are optional.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description:
      'Filter by clothing category (e.g., t-shirt, jeans, dress, jacket)',
  })
  @ApiQuery({
    name: 'relevance',
    required: false,
    type: Boolean,
    description:
      'Sort by relevance (highly reviewed products first). Calculated as avgRating * reviewCount',
  })
  @ApiQuery({
    name: 'priceSort',
    required: false,
    enum: ['LOW_TO_HIGH', 'HIGH_TO_LOW'],
    description: 'Sort products by price',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: Number,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: Number,
    description: 'Maximum price filter',
  })
  @ApiQuery({
    name: 'exactPrice',
    required: false,
    type: Number,
    description: 'Exact price filter (overrides min/max)',
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description:
      'Filter by size(s). Comma-separated for multiple sizes (e.g., M,L,XL)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of products with filters applied',
    schema: {
      example: {
        data: [
          {
            _id: '6996f404375fc77a5f4204bc',
            name: 'Classic Cotton T-Shirt',
            category: 't-shirt',
            price: 29.99,
            discountPercent: 15,
            sizes: ['M', 'L', 'XL'],
            tags: ['summer', 'casual'],
            reviewCount: 24,
            avgRating: 4.5,
            relevanceScore: 108,
            createdAt: '2026-02-19T11:29:08.367Z',
            updatedAt: '2026-02-19T11:29:08.367Z',
          },
        ],
        meta: {
          total: 500,
          page: 1,
          limit: 10,
          totalPages: 50,
        },
      },
    },
  })
  findAll(@Query() filterDto: FilterProductsDto) {
    return this.productsService.findAllWithFilters(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns product details',
    schema: {
      example: {
        _id: '6996f404375fc77a5f4204bc',
        name: 'Classic Cotton T-Shirt',
        category: 't-shirt',
        price: 29.99,
        discountPercent: 15,
        sizes: ['M', 'L', 'XL'],
        createdAt: '2026-02-19T11:29:08.367Z',
        updatedAt: '2026-02-19T11:29:08.367Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }
}
