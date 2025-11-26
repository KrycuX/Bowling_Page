import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryImage } from '../../database/entities';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class GalleryService {
  private readonly uploadDir = path.join(process.cwd(), 'public', 'uploads', 'gallery');

  constructor(
    @InjectRepository(GalleryImage)
    private galleryImageRepository: Repository<GalleryImage>,
  ) {
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directory:', error);
    }
  }

  async getPublicImages(section?: string): Promise<GalleryImage[]> {
    const where: any = {};
    if (section) {
      where.section = section;
    }

    return this.galleryImageRepository.find({
      where,
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async getAllImages(): Promise<GalleryImage[]> {
    return this.galleryImageRepository.find({
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async getImage(id: number): Promise<GalleryImage> {
    const image = await this.galleryImageRepository.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Gallery image not found');
    }

    return image;
  }

  async uploadImage(
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    section?: string,
    caption?: string,
  ): Promise<GalleryImage> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit.');
    }

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const uniqueFilename = `${crypto.randomUUID()}${fileExt}`;
    const filePath = path.join(this.uploadDir, uniqueFilename);

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Generate URL
    const url = `/uploads/gallery/${uniqueFilename}`;

    // Get max order for the section
    const maxOrder = await this.galleryImageRepository
      .createQueryBuilder('image')
      .where('image.section = :section OR (image.section IS NULL AND :section IS NULL)', {
        section: section || null,
      })
      .select('MAX(image.order)', 'maxOrder')
      .getRawOne();

    const order = (maxOrder?.maxOrder ?? -1) + 1;

    // Create database record
    const image = this.galleryImageRepository.create({
      filename: uniqueFilename,
      originalFilename: file.originalname,
      path: filePath,
      url,
      section: section || null,
      order,
      caption: caption || null,
    });

    return this.galleryImageRepository.save(image);
  }

  async updateImage(
    id: number,
    updates: {
      section?: string | null;
      order?: number;
      caption?: string | null;
    },
  ): Promise<GalleryImage> {
    const image = await this.getImage(id);

    if (updates.section !== undefined) {
      image.section = updates.section;
    }
    if (updates.order !== undefined) {
      image.order = updates.order;
    }
    if (updates.caption !== undefined) {
      image.caption = updates.caption;
    }

    return this.galleryImageRepository.save(image);
  }

  async deleteImage(id: number): Promise<void> {
    const image = await this.getImage(id);

    // Delete file from disk
    try {
      await fs.unlink(image.path);
    } catch (error) {
      console.error(`Failed to delete file ${image.path}:`, error);
      // Continue even if file deletion fails
    }

    // Delete database record
    await this.galleryImageRepository.remove(image);
  }
}

