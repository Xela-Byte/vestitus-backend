import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review, ReviewDocument } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(
    productId: string,
    createReviewDto: CreateReviewDto,
    userId?: string,
    userRole?: string,
  ): Promise<ReviewDocument> {
    // If user is authenticated (has userId and userRole from JWT), use their ID and role
    // Otherwise, set as anonymous
    const reviewData = {
      ...createReviewDto,
      productId,
      addedBy: userId || 'anonymous',
      role: userRole || 'anonymous',
    };

    const newReview = new this.reviewModel(reviewData);
    return newReview.save();
  }

  async findByProductId(
    productId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    // Get reviews for the product
    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find({ productId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.reviewModel.countDocuments({ productId }),
    ]);

    // Populate user data based on role
    const populatedReviews = await Promise.all(
      reviews.map(async (review) => {
        const reviewObj = review.toObject();

        // If not anonymous, populate user/admin data
        if (
          reviewObj.role !== 'anonymous' &&
          reviewObj.addedBy !== 'anonymous'
        ) {
          const user = await this.userModel
            .findById(reviewObj.addedBy)
            .select('fullName')
            .exec();

          if (user) {
            return {
              ...reviewObj,
              addedBy: {
                fullName: user.fullName,
              },
            };
          }
        }

        return reviewObj;
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: populatedReviews,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
