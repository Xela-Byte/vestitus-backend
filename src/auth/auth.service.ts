// auth.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private appleJwksClient: jwksClient.JwksClient;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {
    // Initialize Google OAuth2 Client
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Initialize Apple JWKS Client for token verification
    this.appleJwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });
  }

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

    // Send OTP via email service
    try {
      await this.emailService.sendOtpEmail(email, otp);
    } catch (error) {
      // Log error but continue - in development, user can still see OTP
      console.error('Failed to send email:', error.message);
    }

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

    // Send password reset confirmation email
    try {
      await this.emailService.sendPasswordResetConfirmation(
        user.email,
        user.fullName,
      );
    } catch (error) {
      // Log error but don't fail - password was already reset
      console.error('Failed to send confirmation email:', error.message);
    }

    return {
      message: 'Password reset successfully',
    };
  }

  // Helper method to get Apple signing key
  private getAppleSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.appleJwksClient.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          resolve(key?.getPublicKey() || '');
        }
      });
    });
  }

  // Google Token Verification
  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        fullName: payload.name || payload.email?.split('@')[0] || 'User',
        profilePicture: payload.picture,
        emailVerified: payload.email_verified,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to verify Google token');
    }
  }

  // Apple Token Verification
  async verifyAppleToken(
    identityToken: string,
    userInfo?: { email?: string; firstName?: string; lastName?: string },
  ) {
    try {
      // Decode token to get the header
      const decodedToken = jwt.decode(identityToken, { complete: true });

      if (!decodedToken || typeof decodedToken === 'string') {
        throw new UnauthorizedException('Invalid Apple token format');
      }

      const { kid } = decodedToken.header;

      if (!kid) {
        throw new UnauthorizedException('Apple token missing key ID');
      }

      // Get Apple's public key
      const publicKey = await this.getAppleSigningKey(kid);

      // Verify the token
      const payload = jwt.verify(identityToken, publicKey, {
        algorithms: ['RS256'],
        audience: process.env.APP_BUNDLE_ID,
        issuer: 'https://appleid.apple.com',
      }) as any;

      // Apple only provides user info on first sign-in
      let fullName = 'User';
      if (userInfo?.firstName || userInfo?.lastName) {
        fullName =
          `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim();
      } else if (payload.email) {
        fullName = payload.email.split('@')[0];
      }

      return {
        appleId: payload.sub,
        email: userInfo?.email || payload.email,
        fullName,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to verify Apple token');
    }
  }

  // Google Sign-In
  async googleSignIn(idToken: string) {
    const googleData = await this.verifyGoogleToken(idToken);

    if (!googleData.email) {
      throw new BadRequestException('Email is required from Google Sign-In');
    }

    // Check if user exists with this email
    let user = await this.usersService.findByEmail(googleData.email);

    if (user) {
      // User exists - link Google account if not already linked
      if (!user.googleId) {
        user = await this.usersService.linkGoogleAccount(
          user._id.toString(),
          googleData.googleId,
          googleData.profilePicture,
        );
      }
    } else {
      // Create new user with Google data
      user = await this.usersService.createOAuthUser({
        email: googleData.email,
        fullName: googleData.fullName,
        googleId: googleData.googleId,
        profilePicture: googleData.profilePicture,
        authProvider: 'google',
      });
    }

    const { password: _, ...result } = user.toObject();
    return this.login(result);
  }

  // Apple Sign-In
  async appleSignIn(
    identityToken: string,
    userInfo?: { email?: string; firstName?: string; lastName?: string },
  ) {
    const appleData = await this.verifyAppleToken(identityToken, userInfo);

    if (!appleData.email) {
      throw new BadRequestException('Email is required from Apple Sign-In');
    }

    // Check if user exists with this email
    let user = await this.usersService.findByEmail(appleData.email);

    if (user) {
      // User exists - link Apple account if not already linked
      if (!user.appleId) {
        user = await this.usersService.linkAppleAccount(
          user._id.toString(),
          appleData.appleId,
        );
      }
    } else {
      // Create new user with Apple data
      user = await this.usersService.createOAuthUser({
        email: appleData.email,
        fullName: appleData.fullName,
        appleId: appleData.appleId,
        authProvider: 'apple',
      });
    }

    const { password: _, ...result } = user.toObject();
    return this.login(result);
  }

  // Link Google Account to Existing User
  async linkGoogleAccount(email: string, password: string, idToken: string) {
    // Validate user credentials
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify Google token
    const googleData = await this.verifyGoogleToken(idToken);

    // Check if Google account is already linked
    if (user.googleId) {
      throw new BadRequestException(
        'Google account already linked to this user',
      );
    }

    // Check if Google ID is already used by another user
    const existingGoogleUser = await this.usersService.findByGoogleId(
      googleData.googleId,
    );
    if (existingGoogleUser) {
      throw new BadRequestException(
        'This Google account is already linked to another user',
      );
    }

    // Link the Google account
    const updatedUser = await this.usersService.linkGoogleAccount(
      user._id.toString(),
      googleData.googleId,
      googleData.profilePicture,
    );

    return this.login(updatedUser);
  }

  // Link Apple Account to Existing User
  async linkAppleAccount(
    email: string,
    password: string,
    identityToken: string,
    userInfo?: { email?: string; firstName?: string; lastName?: string },
  ) {
    // Validate user credentials
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify Apple token
    const appleData = await this.verifyAppleToken(identityToken, userInfo);

    // Check if Apple account is already linked
    if (user.appleId) {
      throw new BadRequestException(
        'Apple account already linked to this user',
      );
    }

    // Check if Apple ID is already used by another user
    const existingAppleUser = await this.usersService.findByAppleId(
      appleData.appleId,
    );
    if (existingAppleUser) {
      throw new BadRequestException(
        'This Apple account is already linked to another user',
      );
    }

    // Link the Apple account
    const updatedUser = await this.usersService.linkAppleAccount(
      user._id.toString(),
      appleData.appleId,
    );

    return this.login(updatedUser);
  }
}
