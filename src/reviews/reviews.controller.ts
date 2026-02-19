import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Create a review for a product (Public - authenticated or anonymous)',
    description:
      'If bearer token is provided and valid, review will be created by authenticated user. Otherwise, review will be anonymous. Only stars and comment are required in the request body.',
  })
  @ApiResponse({
    status: 201,
    description: 'Review successfully created',
    schema: {
      example: {
        _id: '6996f404375fc77a5f4204bc',
        productId: '6996f404375fc77a5f4204ba',
        addedBy: '6996f404375fc77a5f4204bd',
        role: 'user',
        stars: 5,
        comment: 'Great product! Highly recommend.',
        createdAt: '2026-02-19T11:29:08.367Z',
        updatedAt: '2026-02-19T11:29:08.367Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(
    @Param('productId') productId: string,
    @Body() createReviewDto: CreateReviewDto,
    @Request() req,
  ) {
    // Extract user info from JWT if present (optional authentication)
    // If no token or invalid token, userId and userRole will be undefined
    // Service will handle setting as anonymous
    const userId = req.user?.sub;
    const userRole = req.user?.role;

    return this.reviewsService.create(
      productId,
      createReviewDto,
      userId,
      userRole,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews for a product' })
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
    description: 'Returns paginated list of reviews for the product',
    schema: {
      example: {
        data: [
          {
            _id: '6996f404375fc77a5f4204bc',
            productId: '6996f404375fc77a5f4204ba',
            addedBy: {
              fullName: 'John Doe',
            },
            role: 'user',
            stars: 5,
            comment: 'Great product! Highly recommend.',
            createdAt: '2026-02-19T11:29:08.367Z',
            updatedAt: '2026-02-19T11:29:08.367Z',
          },
          {
            _id: '6996f404375fc77a5f4204be',
            productId: '6996f404375fc77a5f4204ba',
            addedBy: 'anonymous',
            role: 'anonymous',
            stars: 4,
            comment: 'Good quality for the price.',
            createdAt: '2026-02-19T12:00:00.000Z',
            updatedAt: '2026-02-19T12:00:00.000Z',
          },
        ],
        meta: {
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5,
          hasNextPage: true,
          hasPreviousPage: false,
        },
      },
    },
  })
  findByProduct(
    @Param('productId') productId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.reviewsService.findByProductId(productId, paginationQuery);
  }
}
