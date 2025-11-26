import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Inject,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AdminGalleryService } from './admin-gallery.service';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../database/entities';
import { IsOptional, IsString, IsNumber, IsInt } from 'class-validator';

class UpdateGalleryImageDto {
  @IsOptional()
  @IsString()
  section?: string | null;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsString()
  caption?: string | null;
}

@ApiTags('admin-gallery')
@Controller('admin/gallery')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
export class AdminGalleryController {
  constructor(@Inject(AdminGalleryService) private readonly adminGalleryService: AdminGalleryService) {}

  @Get()
  @ApiOperation({ summary: 'List all gallery images (admin)' })
  async listImages() {
    return this.adminGalleryService.getAllImages();
  }

  @Post()
  @ApiOperation({ summary: 'Upload new gallery image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: { originalname: string; mimetype: string; size: number; buffer: Buffer } | undefined,
    @Body('section') section?: string,
    @Body('caption') caption?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.adminGalleryService.uploadImage(file, section, caption);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update gallery image' })
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGalleryImageDto,
  ) {
    return this.adminGalleryService.updateImage(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete gallery image' })
  async deleteImage(@Param('id', ParseIntPipe) id: number) {
    await this.adminGalleryService.deleteImage(id);
    return { success: true };
  }
}

