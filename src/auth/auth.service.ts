// auth.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database (valid for 10 minutes)
    await this.usersService.saveOtp(email, otp, 10);

    // TODO: Send OTP via email service
    // For now, we'll log it (in production, use a proper email service)
    console.log(`OTP for ${email}: ${otp}`);

    return {
      message: 'OTP sent to your email address',
      // In development, return the OTP (remove in production)
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.verifyOtp(email, otp);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Generate a temporary token for password reset (valid for 15 minutes)
    const payload = {
      sub: user._id,
      email: user.email,
      type: 'password-reset',
    };
    const resetToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // Clear the OTP after successful verification
    await this.usersService.clearOtp(email);

    return {
      message: 'OTP verified successfully',
      access_token: resetToken,
    };
  }

  async resetPassword(userId: string, newPassword: string) {
    const user = await this.usersService.resetPassword(userId, newPassword);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Password reset successfully',
    };
  }
}
