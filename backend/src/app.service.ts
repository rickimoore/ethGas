import { Injectable, Inject } from '@nestjs/common';
import {CACHE_MANAGER} from "@nestjs/cache-manager/dist";
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
  async getRecommendations() {
    return await this.cacheManager.get('fee-recommendations')
  }
}
