import sharp from 'sharp';
import { Dimention } from '../../domain/dimentaion';
import S3Api from './s3Api';

export default class Resizer {
  private readonly s3Api: S3Api;

  constructor(s3Api: S3Api) {
    this.s3Api = s3Api;
  }

  async resize(
    fileKey: string,
    dimention: Dimention,
    isWebp = false,
  ): Promise<Buffer> {
    try {
      const fileBody = await this.s3Api.get(fileKey);
      const sharpBody = sharp(fileBody as any);
      const metaData = await sharpBody.metadata();
      // 元画像が指定されたサイズより小さければ引き伸ばししない
      const originalWidth = metaData.width ?? 0;
      const originalHeight = metaData.height ?? 0;

      const options = {
        width:
          originalWidth < dimention.width ? originalWidth : dimention.width,
        height:
          originalHeight < dimention.height ? originalHeight : dimention.height,
        webp: isWebp,
      };

      sharpBody.resize(options.width, options.height);

      if (options.webp) {
        sharpBody.webp();
      }

      const result = await sharpBody.rotate().toBuffer();

      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
