import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { AddressNickname } from '../entities/address.entity';

export class CreateAddressDto {
  @ApiProperty({
    enum: AddressNickname,
    description: 'Address nickname',
    example: 'home',
  })
  @IsEnum(AddressNickname)
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({
    description: 'Full address',
    example: '123 Main Street, New York, NY 10001, USA',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    description: 'Set this address as default',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
