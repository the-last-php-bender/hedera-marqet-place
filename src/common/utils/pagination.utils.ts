import { Model, Document, PopulateOptions } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dtos/pagination-query.dto';

// Define a type for the pagination query parameters
// export interface PaginationQueryDto {
//     page?: number;
//     limit?: number;
// }

// Define a type for the pagination metadata returned in the response
export interface PaginationMetadata {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Define a type for the paginated result
export interface PaginatedResult<T> {
    data: T[];
    pagination: PaginationMetadata;
    metadata?: Record<string, any>
}

export interface PaginateOptions<T> {
    model: Model<T>,
    filter: Record<string, any>, // Query filter for the model
    params: PaginationQueryDto,
    select?: string,
    populate?: PopulateOptions[],
    sort?: Record<string, 1 | -1>// Default sort by createdAt descending
}

export async function paginate<T extends Document>(
    options: PaginateOptions<T>
): Promise<PaginatedResult<T>> {
    const { model, filter, params, select, populate, sort = { createdAt: -1 } } = options;
    const page = params.page || 1;
    const limit = params.limit || 25;
    const skip = (page - 1) * limit;

    let query = model.find(filter)
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);

    // Execute queries in parallel for efficiency
    const [data, totalItems] = await Promise.all([
        query.sort(sort).skip(skip).limit(limit).lean<T[]>(),
        model.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
        data,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            pageSize: limit,
            hasNextPage,
            hasPreviousPage,
        },
    };
    
}