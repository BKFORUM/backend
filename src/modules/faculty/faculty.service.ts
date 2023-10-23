import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/services';

@Injectable()
export class FacultyService {
  constructor(private readonly dbContext: PrismaService) {}

  async getAllFaculty() {
    const faculties = await this.dbContext.faculty.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
      },
    });

    return faculties;
  }

  async getFacultyById(id: string) {
    const faculty = await this.dbContext.faculty.findUniqueOrThrow({
      where: { id },
    });

    return faculty;
  }
}
