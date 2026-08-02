import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { path as appRootPath } from 'app-root-path';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Auth } from 'src/auth/decorators/auth.decorator';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 МБ

@Controller('files')
export class FileController {

  @HttpCode(200)
  @Post()
  @Auth('admin')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: `${appRootPath}/assets`,
      filename: (_req, file, callback) => {
        // Имя не берём из originalname — оно приходит от клиента
        const ext = extname(file.originalname).toLowerCase();
        const unique = `product-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        callback(null, `${unique}${ext}`);
      }
    }),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, callback) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return callback(new BadRequestException('Допустимы только изображения JPEG, PNG или WebP'), false);
      }
      callback(null, true);
    }
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не получен: поле формы должно называться image');

    return {
      filename: file.filename,
      url: `/assets/${file.filename}`
    };
  }
}
