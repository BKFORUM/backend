import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorator';
import { UserRole } from 'src/common/types/enum';
import { PaginatedResult } from 'src/providers';
import { GetAllForumsDto } from './dto';
import { ForumService } from './forum.service';
import { ForumResponse } from './interfaces';
import { AccessTokenGuard } from 'src/guard';

@ApiBearerAuth()
@ApiTags('Forum')
@Controller({
  version: '1',
  path: 'forums',
})
@UseGuards(AccessTokenGuard)
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @ApiOperation({
    description: 'Get all forums only by ADMIN'
  })
  @Roles(UserRole.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllForums(@Query() query: GetAllForumsDto): Promise<PaginatedResult<ForumResponse>> {
    return await this.forumService.getAllForums(query);
  }

}
