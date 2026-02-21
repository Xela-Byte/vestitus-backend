import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AppleAuthDto {
  @ApiProperty({
    description: 'Apple identity token from Apple Sign-In SDK',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3...',
  })
  @IsString()
  @IsNotEmpty()
  identityToken: string;

  @ApiProperty({
    description: 'User information (only provided on first sign-in)',
    required: false,
    example: {
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
  })
  @IsOptional()
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}
