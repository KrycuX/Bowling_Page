import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../../database/entities';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private resourceRepository: Repository<Resource>,
  ) {}

  async findAll(resourceType?: string): Promise<Resource[]> {
    const query = this.resourceRepository.createQueryBuilder('resource');
    
    if (resourceType) {
      query.where('resource.type = :resourceType', { resourceType });
    }
    
    return query.orderBy('resource.id', 'ASC').getMany();
  }

  async findOne(id: number): Promise<Resource | null> {
    return this.resourceRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Resource | null> {
    return this.resourceRepository.findOne({ where: { name } });
  }

  async getAllResources(): Promise<Resource[]> {
    return this.resourceRepository.find({
      order: { id: 'ASC' }
    });
  }
}
