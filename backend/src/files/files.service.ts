import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';

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

  async deleteFiles(fileUrls: string[]): Promise<void> {
    for (const fileUrl of fileUrls) {
      try {
        const fileName = fileUrl.split('/').pop();
        if (!fileName) continue;

        const fileRecord = await this.filesRepository.findOne({
          where: { path: fileName },
        });

        const fullPath = path.join(process.cwd(), 'public', fileName);
        if (fs.existsSync(fullPath)) {
          await fs.promises.unlink(fullPath);
          console.log(`Файл удален: ${fullPath}`);
        }

        if (fileRecord) {
          await this.filesRepository.remove(fileRecord);
          console.log(`Удалена запись из БД: ${fileName}`);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`Ошибка удаления файла ${fileUrl}:`, errorMessage);
      }
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    await this.deleteFiles([fileUrl]);
  }
}
