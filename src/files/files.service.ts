import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {}

  async createFile(fileData: {
    filename: string;
    path: string;
    mimetype: string;
    size: number;
  }): Promise<File> {
    const file = this.filesRepository.create(fileData);
    return this.filesRepository.save(file);
  }
}
