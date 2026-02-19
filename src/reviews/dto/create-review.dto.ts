import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Star rating from 1 to 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  stars: number;

  @ApiProperty({
    description: 'Review comment',
    example: 'Great product! Highly recommend.',
  })
  @IsNotEmpty()
  @IsString()
  comment: string;
}
