import { S3 } from 'aws-sdk';

export default class S3Api {
  private readonly bucketName: string;
  private readonly s3 = new S3();

  constructor(bucketName: string) {
    this.bucketName = bucketName;
  }

  async get(fileKey: string) {
    try {
      const params: S3.GetObjectRequest = {
        Bucket: this.bucketName,
        Key: fileKey,
      };
      const res = await this.s3.getObject(params).promise();

      if (!res.Body) {
        throw Error('response is not include body');
      }

      return res.Body;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
