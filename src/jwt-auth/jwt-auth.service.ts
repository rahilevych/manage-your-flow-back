/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';

import { RegisterDto } from './dto/create-user.dto';
import argon2d from 'argon2';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

import { JwtService } from '@nestjs/jwt';
import { TokensService } from 'src/tokens/tokens.service';
import { LoginDto } from './dto/login-user.dto';
import { JwtPayload } from './jwt.strategy';
import { Member } from 'src/generated/prisma/client';

@Injectable()
export class JwtAuthService {
  private readonly logger = new Logger(JwtAuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private tokensService: TokensService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords don`t match');
    }
    const hashedPassword = await argon2d.hash(dto.password, {
      type: argon2d.argon2id,
    });

    const user = await this.usersService.createUser(dto, hashedPassword);
    if (user) {
      const tokens = await this.generateTokens(user?.id);

      return { user, tokens };
    }
  }
  async login(dto: LoginDto) {
    const user = await this.usersService.findUserByEmail(dto.email);
    if (user) {
      const isPassMatch = await argon2d.verify(
        user?.passwordHash,
        dto.password,
      );
      if (!isPassMatch)
        throw new UnauthorizedException('Invalid email or password');
      const tokens = await this.generateTokens(user.id);
      const { passwordHash, ...userWithoutPass } = user;

      return { userWithoutPass, ...tokens };
    }
  }
  async logout(refreshToken: string) {
    await this.tokensService.deleteTokenFromDB(refreshToken);
  }

  async generateTokens(userId: string) {
    if (!userId) throw new BadRequestException('User id is not provided');
    const user = await this.usersService.findUserById(userId);
    const payload = {
      id: user?.id,
      email: user?.email,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15d',
    });

    await this.tokensService.saveTokenToDB(refreshToken, userId);
    return { accessToken, refreshToken };
  }

  async verifyTokens(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      refreshToken,
      {
        secret: this.configService.get<string>('JWT_SECRET'),
      },
    );

    await this.tokensService.findRefreshToken(refreshToken);
    return payload;
  }
  async refreshTokens(refreshToken: string, member?: Member) {
    const payload = await this.verifyTokens(refreshToken);
    const tokens = await this.generateTokens(payload.id);

    return tokens;
  }
}
