import { Body, Controller, HttpCode, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  async login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('register')
  async register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login/accessToken')
  async getNewTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.getNewTokens(dto.refreshToken);
  }

}
