import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns current user details',
    schema: {
      example: {
        _id: '6996f404375fc77a5f4204bc',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        phoneNumber: '+1234567890',
        favourites: [],
        createdAt: '2026-02-19T11:29:08.367Z',
        updatedAt: '2026-02-19T11:29:08.367Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getMe(@Request() req) {
    return this.usersService.findOne(req.user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile successfully updated',
    schema: {
      example: {
        _id: '6996f404375fc77a5f4204bc',
        fullName: 'John Updated',
        email: 'newemail@example.com',
        role: 'user',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        phoneNumber: '+1234567890',
        favourites: [],
        createdAt: '2026-02-19T11:29:08.367Z',
        updatedAt: '2026-02-19T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
  })
  updateMe(@Body() updateProfileDto: UpdateProfileDto, @Request() req) {
    return this.usersService.update(req.user.sub, updateProfileDto);
  }

  @Get('me/favourites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user favourites' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of favourite products',
    schema: {
      example: [
        {
          _id: '6996f404375fc77a5f4204ba',
          name: 'Elegant Summer Dress',
          category: 'Dresses',
          price: 89.99,
          discountPercent: 15,
          sizes: ['S', 'M', 'L'],
          tags: ['summer', 'elegant', 'casual'],
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getFavourites(@Request() req) {
    return this.usersService.getFavourites(req.user.sub);
  }

  @Post('me/favourites/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add product to favourites' })
  @ApiResponse({
    status: 201,
    description: 'Product added to favourites',
    schema: {
      example: {
        _id: '6996f404375fc77a5f4204bc',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        favourites: ['6996f404375fc77a5f4204ba'],
        createdAt: '2026-02-19T11:29:08.367Z',
        updatedAt: '2026-02-19T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'Product already in favourites',
  })
  addToFavourites(@Param('productId') productId: string, @Request() req) {
    return this.usersService.addToFavourites(req.user.sub, productId);
  }

  @Delete('me/favourites/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove product from favourites' })
  @ApiResponse({
    status: 200,
    description: 'Product removed from favourites',
    schema: {
      example: {
        _id: '6996f404375fc77a5f4204bc',
        fullName: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        favourites: [],
        createdAt: '2026-02-19T11:29:08.367Z',
        updatedAt: '2026-02-19T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User or product not found' })
  removeFromFavourites(@Param('productId') productId: string, @Request() req) {
    return this.usersService.removeFromFavourites(req.user.sub, productId);
  }
}
