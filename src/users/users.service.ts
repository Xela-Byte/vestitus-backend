import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { paginate } from 'src/common/utils/pagination.helper';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return newUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<UserDocument>> {
    return paginate(this.userModel, paginationQuery, {}, '-password');
  }

  findOne(id: string) {
    return this.userModel.findById(id).select('-password').exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.userModel.findById(id).exec();

    if (!existingUser) {
      throw new ConflictException('User not found');
    }

    // If email is being updated, check for duplicates
    if (updateUserDto.email) {
      const duplicateUser = await this.userModel.findOne({
        email: updateUserDto.email,
        _id: { $ne: id }, // Exclude current user
      });

      if (duplicateUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
  }

  remove(id: string) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async saveOtp(email: string, otp: string, expiryMinutes: number = 10) {
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiryDate = new Date(Date.now() + expiryMinutes * 60 * 1000);

    return this.userModel
      .findOneAndUpdate(
        { email },
        {
          resetOtp: hashedOtp,
          resetOtpExpiry: expiryDate,
        },
        { new: true },
      )
      .exec();
  }

  async verifyOtp(email: string, otp: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user || !user.resetOtp || !user.resetOtpExpiry) {
      return null;
    }

    // Check if OTP is expired
    if (user.resetOtpExpiry < new Date()) {
      return null;
    }

    // Verify OTP
    const isValidOtp = await bcrypt.compare(otp, user.resetOtp);

    if (!isValidOtp) {
      return null;
    }

    return user;
  }

  async clearOtp(email: string) {
    return this.userModel
      .findOneAndUpdate(
        { email },
        {
          $unset: { resetOtp: '', resetOtpExpiry: '' },
        },
        { new: true },
      )
      .exec();
  }

  async resetPassword(
    userId: string,
    newPassword: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      return null;
    }

    // Check if password was used before
    const passwordHistory = user.passwordHistory || [];
    for (const oldPassword of passwordHistory) {
      const isSamePassword = await bcrypt.compare(newPassword, oldPassword);
      if (isSamePassword) {
        throw new ConflictException(
          'Cannot reuse a previous password. Please choose a different password.',
        );
      }
    }

    // Check against current password
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      throw new ConflictException(
        'Cannot reuse your current password. Please choose a different password.',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Add current password to history (keep last 5 passwords)
    const updatedHistory = [user.password, ...passwordHistory].slice(0, 5);

    // Update password and history
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          password: hashedPassword,
          passwordHistory: updatedHistory,
          $unset: { resetOtp: '', resetOtpExpiry: '' },
        },
        { new: true },
      )
      .exec();
  }

  async addToFavourites(
    userId: string,
    productId: string,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if product is already in favourites
    if (user.favourites.includes(productId)) {
      throw new ConflictException('Product already in favourites');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $push: { favourites: productId } },
        { new: true },
      )
      .select('-password')
      .exec();

    return updatedUser!;
  }

  async removeFromFavourites(
    userId: string,
    productId: string,
  ): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if product is in favourites
    if (!user.favourites.includes(productId)) {
      throw new NotFoundException('Product not found in favourites');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { favourites: productId } },
        { new: true },
      )
      .select('-password')
      .exec();

    return updatedUser!;
  }

  async getFavourites(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .populate('favourites')
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.favourites;
  }
}
