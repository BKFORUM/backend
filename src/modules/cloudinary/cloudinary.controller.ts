import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/guard';

@ApiTags('Image')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('images')
export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('documents', 5))
  async upload(@UploadedFiles() documents: Express.Multer.File[]) {
    return this.cloudinaryService.uploadImages(documents);
  }
}
