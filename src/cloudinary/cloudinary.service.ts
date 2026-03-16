import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folderName: string
  ): Promise<UploadApiResponse> {
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folderName,
            resource_type: 'image',
            invalidate: true,
          },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined
          ) => {
            if (error) {
              return reject(error);
            }

            if (!result) {
              return reject(new Error('Cloudinary upload returned no result'));
            }

            resolve(result);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload image to Cloudinary: ${error.message}`
      );
    }
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
      throw new InternalServerErrorException(
        `Error while deleting folder ${folderPath}: ${error.message}`
      );
    }
  }
}
