import { Roles } from '@common/decorator';
import { UserRole } from '@common/types';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/guard';
import { FacultyService } from './faculty.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Faculty')
@Controller('faculty')
@UseGuards(AccessTokenGuard)
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}
  @Roles(UserRole.ADMIN)
  @Get()
  async getAllFaculty() {
    return this.facultyService.getAllFaculty();
  }
}
