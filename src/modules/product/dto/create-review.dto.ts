import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 5, description: 'Product rating (1-5)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Very effective product', description: 'User review text' })
  @IsString()
  @IsNotEmpty()
  review: string;
}
