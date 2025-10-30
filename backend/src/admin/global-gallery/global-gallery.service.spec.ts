import { Test, TestingModule } from '@nestjs/testing';
import { GlobalGalleryService } from './global-gallery.service';

describe('GlobalGalleryService', () => {
  let service: GlobalGalleryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalGalleryService],
    }).compile();

    service = module.get<GlobalGalleryService>(GlobalGalleryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
