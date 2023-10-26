import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto';
import { LoginCredentialDto } from './dto';
import { AccessTokenGuard } from 'src/guard/accessToken.guard';
import { RefreshTokenGuard } from 'src/guard/refreshToken.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signUp')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post('login')
  login(@Body() data: LoginCredentialDto) {
    const { email, password } = data;
    return this.authService.login(email, password);
  }

  @Post('forgot-password')
  forgotPassword(@Body() data: ForgotPasswordDto) {
    const { email } = data;
    return this.authService.sendForgotPasswordEmail(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.authService.resetPassword(body);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req: Request) {
    this.authService.logout(req.user['sub']);
  }

  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    const userId = req.user['id'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
