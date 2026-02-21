import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LinkAccountDto {
  @ApiProperty({
    description: 'Email of the existing account',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password of the existing account',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LinkGoogleAccountDto extends LinkAccountDto {
  @ApiProperty({
    description: 'Google ID token from Google Sign-In SDK',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjI3...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class LinkAppleAccountDto extends LinkAccountDto {
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
  })
  @IsOptional()
  user?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}
