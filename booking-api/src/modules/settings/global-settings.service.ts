import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from '../../database/entities';

    

@Injectable()
export class GlobalSettingsService {
  constructor(
    @InjectRepository(AppSettings)
    private settingsRepository: Repository<AppSettings>,
  ) {
    console.log('GlobalSettingsService constructor called');
  }

 
  async getGlobalSettings(): Promise<AppSettings> {
    let settings = await this.settingsRepository.findOne({
      where: { id: 1 },
    });

    if (!settings) {
      settings = this.settingsRepository.create({ id: 1 });
      await this.settingsRepository.save(settings);
    }

    return settings;
  }
}
