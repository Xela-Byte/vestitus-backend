import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address, AddressDocument } from './entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
  ) {}

  async create(
    createAddressDto: CreateAddressDto,
    userId: string,
  ): Promise<AddressDocument> {
    const newAddress = new this.addressModel({
      ...createAddressDto,
      userId,
    });

    const savedAddress = await newAddress.save();

    // If this address is set as default, ensure only one address is default
    if (createAddressDto.isDefault) {
      // Remove default from other addresses
      await this.addressModel.updateMany(
        { userId, _id: { $ne: savedAddress._id } },
        { isDefault: false },
      );
    }

    return savedAddress;
  }

  async findAllByUser(userId: string): Promise<AddressDocument[]> {
    return this.addressModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string): Promise<AddressDocument> {
    const address = await this.addressModel.findById(id).exec();

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Ensure user owns this address
    if (address.userId.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this address');
    }

    return address;
  }

  async update(
    id: string,
    updateAddressDto: UpdateAddressDto,
    userId: string,
  ): Promise<AddressDocument> {
    const address = await this.findOne(id, userId);

    Object.assign(address, updateAddressDto);
    const updatedAddress = await address.save();

    // If setting this address as default, ensure only one address is default
    if (updateAddressDto.isDefault) {
      // Remove default from other addresses
      await this.addressModel.updateMany(
        { userId, _id: { $ne: id } },
        { isDefault: false },
      );
    }

    return updatedAddress;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.addressModel.findByIdAndDelete(id).exec();
  }
}
