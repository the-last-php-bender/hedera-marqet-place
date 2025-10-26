
import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    price: number;

    @ApiProperty()
    video3D

    @ApiProperty()
    thumbnail: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
