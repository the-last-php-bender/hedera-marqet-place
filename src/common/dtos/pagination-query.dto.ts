import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
    @ApiPropertyOptional({
        description: 'The page number for pagination. Defaults to 1.',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Page must be an integer.' })
    @Min(1, { message: 'Page must be at least 1.' })
    page: number = 1;

    @ApiPropertyOptional({
        description: 'The number of items to return per page. Defaults to 10.',
        example: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer.' })
    @Min(1, { message: 'Limit must be at least 1.' })
    limit: number = 10;
}
