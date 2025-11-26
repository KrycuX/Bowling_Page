import { Injectable, Inject } from '@nestjs/common';
import { GalleryService } from '../../gallery/gallery.service';

@Injectable()
export class AdminGalleryService {
  constructor(@Inject(GalleryService) private readonly galleryService: GalleryService) {}

  async getAllImages() {
    return this.galleryService.getAllImages();
  }

  async uploadImage(file: { originalname: string; mimetype: string; size: number; buffer: Buffer }, section?: string, caption?: string) {
    return this.galleryService.uploadImage(file, section, caption);
  }

  async updateImage(
    id: number,
    updates: {
      section?: string | null;
      order?: number;
      caption?: string | null;
    },
  ) {
    return this.galleryService.updateImage(id, updates);
  }

  async deleteImage(id: number) {
    return this.galleryService.deleteImage(id);
  }
}

