import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class FileUploadService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { resource_type: 'image' },
        (error, result) => {
          if (error) {
            return reject({
              message: 'Failed Upload image',
              error,
            });
          }
          resolve(result);
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }

  async uploadImages(
    files: Express.Multer.File[],
  ): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    const uploadPromises = files.map(
      (file) =>
        new Promise<UploadApiResponse | UploadApiErrorResponse>(
          (resolve, reject) => {
            const upload = v2.uploader.upload_stream(
              { resource_type: 'image' },
              (error, result) => {
                if (error) {
                  return reject({
                    message: 'Failed Upload image',
                    error,
                  });
                }
                resolve(result);
              },
            );

            toStream(file.buffer).pipe(upload);
          },
        ),
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new Error('Failed to upload one or more images');
    }
  }
}
