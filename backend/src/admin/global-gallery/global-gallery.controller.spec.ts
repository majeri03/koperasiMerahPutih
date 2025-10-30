import { Test, TestingModule } from '@nestjs/testing';
import { GlobalGalleryController } from './global-gallery.controller';

describe('GlobalGalleryController', () => {
  let controller: GlobalGalleryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalGalleryController],
    }).compile();

    controller = module.get<GlobalGalleryController>(GlobalGalleryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
