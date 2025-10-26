import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones' })
  name: string;

  @ApiProperty({ example: 'Noise cancelling Bluetooth headphones' })
  description: string;

  @ApiProperty({ example: 49.99 })
  price: number;

  @ApiProperty({ example: 'http:your3d_video.com' })
  video3D: number;

  @ApiProperty({example:"01-1234"})
  nafdacNo: string

  @ApiProperty({ type: 'string', format: 'binary', description: 'Product thumbnail image' })
  thumbnail: any; 

}
