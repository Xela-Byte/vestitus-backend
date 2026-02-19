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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post('me')
  @ApiOperation({ summary: 'Create a new address for authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        nickname: 'home',
        address: '123 Main Street, New York, NY 10001, USA',
        userId: '507f191e810c19729de860ea',
        isDefault: true,
        createdAt: '2026-02-19T14:30:00.000Z',
        updatedAt: '2026-02-19T14:30:00.000Z',
      },
    },
  })
  create(@Body() createAddressDto: CreateAddressDto, @Request() req: any) {
    return this.addressesService.create(createAddressDto, req.user.userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get all addresses for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of addresses',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          nickname: 'home',
          address: '123 Main Street, New York, NY 10001, USA',
          userId: '507f191e810c19729de860ea',
          isDefault: true,
          createdAt: '2026-02-19T14:30:00.000Z',
          updatedAt: '2026-02-19T14:30:00.000Z',
        },
      ],
    },
  })
  findAll(@Request() req: any) {
    return this.addressesService.findAllByUser(req.user.userId);
  }

  @Get('me/:id')
  @ApiOperation({ summary: 'Get a specific address by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns address details',
  })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @ApiResponse({
    status: 403,
    description: 'You do not have access to this address',
  })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.addressesService.findOne(id, req.user.userId);
  }

  @Patch('me/:id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @ApiResponse({
    status: 403,
    description: 'You do not have access to this address',
  })
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req: any,
  ) {
    return this.addressesService.update(id, updateAddressDto, req.user.userId);
  }

  @Delete('me/:id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({
    status: 200,
    description: 'Address deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Address not found' })
  @ApiResponse({
    status: 403,
    description: 'You do not have access to this address',
  })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.addressesService.remove(id, req.user.userId);
  }
}
