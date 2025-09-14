import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folderName: string
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          transformation: [{ fetch_format: 'webp' }, { quality: 'auto' }],
          invalidate: true,
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

  async deleteFolder(categoryFolder: string, idNumber: string): Promise<void> {
    const folderPath = `products/${categoryFolder}/${idNumber}`;

    try {
      await cloudinary.api.delete_resources_by_prefix(folderPath);

      const { resources } = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
        max_results: 1,
      });

      if (!resources || resources.length === 0) {
        await cloudinary.api.delete_folder(folderPath);

        const parentFolder = `products/${categoryFolder}`;
        const { resources: parentResources } = await cloudinary.api.resources({
          type: 'upload',
          prefix: parentFolder,
          max_results: 1,
        });

        if (!parentResources || parentResources.length === 0) {
          await cloudinary.api.delete_folder(parentFolder);
        }
      }
    } catch (error) {
      throw new Error(
        `Error while deleting folder ${folderPath}: ${error.message}`
      );
    }
  }
}
