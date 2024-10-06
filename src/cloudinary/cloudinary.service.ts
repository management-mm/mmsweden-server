import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, v2 } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folderName: string
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          folder: folderName,
          transformation: [{ quality: 'auto' }, { fetch_format: 'webp' }],
        },
        (error, result) => {
          if (error) {
            reject(error);
          }
          resolve(result);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(upload);
    });
  }
}
