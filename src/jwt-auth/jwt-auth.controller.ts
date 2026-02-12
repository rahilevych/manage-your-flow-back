import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthService } from './jwt-auth.service';
import { RegisterDto } from './dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login-user.dto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoggedUser } from 'src/users/decorators/logged-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class JwtAuthController {
  constructor(private readonly jwtAuthService: JwtAuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1...',
        user: { id: 'uuid', email: 'user@example.com', name: 'John Doe' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request (Validation failed)' })
  @ApiResponse({ status: 409, description: 'Conflict (Email already exists)' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.jwtAuthService.register(dto);
    res.cookie('refreshToken', data?.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return {
      accessToken: data?.tokens.accessToken,
      user: data?.user,
    };
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticates user and returns access token with user data. Sets refresh token in HttpOnly cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1...',
        user: { id: 'uuid', email: 'user@example.com', name: 'John Doe' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.jwtAuthService.login(dto);
    res.cookie('refreshToken', data?.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken: data?.accessToken,
      user: data?.userWithoutPass,
    };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Access Token update',
    description: 'Get Refresh token from cookies und return new Access token ',
  })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'Token successfully updated',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1...' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refres token is invalid' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies.refreshToken;

    const tokens = await this.jwtAuthService.refreshTokens(token);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return tokens.accessToken;
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the  data of the current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profiled retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing Access Token.',
  })
  getMe(@LoggedUser() user: LoggedUser) {
    return user;
  }

  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidates the current session and clears auth cookies',
  })
  @ApiResponse({ status: 200, description: 'Logged out successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const token = req.cookies.refreshToken;
    await this.jwtAuthService.logout(token);

    res.cookie('refreshToken', '', {
      httpOnly: true,
      maxAge: 0,
      secure: true,
      sameSite: 'none',
    });
    return { message: 'User successfully logged out' };
  }
}
