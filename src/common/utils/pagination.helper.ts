import { Model } from 'mongoose';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginatedResult } from '../interfaces/paginated-result.interface';

/**
 * Generic pagination helper for Mongoose models
 * @param model - Mongoose model to paginate
 * @param paginationQuery - Pagination parameters (page, limit)
 * @param filter - Optional filter to apply to the query
 * @param selectFields - Optional fields to select/exclude (e.g., '-password')
 * @returns Paginated result with data and metadata
 */
export async function paginate<T>(
  model: Model<T>,
  paginationQuery: PaginationQueryDto,
  filter: Record<string, any> = {},
  selectFields?: string,
): Promise<PaginatedResult<T>> {
  const { page = 1, limit = 10 } = paginationQuery;
  const skip = (page - 1) * limit;

  // Build query
  let query = model.find(filter).skip(skip).limit(limit);

  // Apply field selection if provided
  if (selectFields) {
    query = query.select(selectFields);
  }

  // Execute query and count in parallel
  const [data, total] = await Promise.all([
    query.exec(),
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
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
