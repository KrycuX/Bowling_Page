import { Module } from '@nestjs/common';
import { AdminGalleryController } from './admin-gallery.controller';
import { AdminGalleryService } from './admin-gallery.service';
import { GalleryModule } from '../../gallery/gallery.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [GalleryModule, AuthModule],
  controllers: [AdminGalleryController],
  providers: [AdminGalleryService],
})
export class AdminGalleryModule {}

