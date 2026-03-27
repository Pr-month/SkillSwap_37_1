import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController;
  let filesService: FilesService;

  const mockFilesService = {
    createFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get<FilesService>(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload file and return response', async () => {
    const mockFile = {
      originalname: 'test.png',
      filename: 'file-123.png',
      mimetype: 'image/png',
      size: 1000,
    } as Express.Multer.File;

    mockFilesService.createFile.mockResolvedValue({
      id: 1,
    });

    const result = await controller.uploadFile(mockFile);

    expect(filesService.createFile).toHaveBeenCalledWith({
      filename: 'test.png',
      path: 'file-123.png',
      mimetype: 'image/png',
      size: 1000,
    });

    expect(result).toEqual({
      id: 1,
      url: '/public/file-123.png',
      filename: 'test.png',
    });
  });
});
