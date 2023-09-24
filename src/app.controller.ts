import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AccessTokenGuard } from './guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
