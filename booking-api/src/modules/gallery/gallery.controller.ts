import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';
import { IsOptional, IsString } from 'class-validator';

@ApiTags('gallery')
@Controller('gallery')
export class GalleryController {
  constructor(@Inject(GalleryService) private readonly galleryService: GalleryService) {}

  @Get()
  @ApiOperation({ summary: 'Get public gallery images' })
  async getImages(@Query('section') section?: string) {
    return this.galleryService.getPublicImages(section);
  }
}

