import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { config, S3 } from 'aws-sdk';
import * as fs from 'fs';
import { nanoid } from 'nanoid';

@Injectable()
export default class S3Service {
  private readonly bucketName: string;
  private readonly s3: S3;
  constructor(configService: ConfigService) {
    this.bucketName = configService.get<string>('AWS_BUCKET_NAME');
    const awsAccessKeyId = configService.get<string>('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );
    const awsRegion = configService.get<string>('AWS_REGION');
    config.update({
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
      region: awsRegion,
    });
    this.s3 = new S3({
      params: {
        Bucket: this.bucketName,
        Expires: 72 * 60 * 60, // 72 hours === 259200 seconds
      },
    });
  }

  private async uploadFileStream(
    key: string,
    fileContent: S3.Body,
  ): Promise<S3.ManagedUpload.SendData> {
    return this.s3
      .upload({ Key: key, Body: fileContent, Bucket: this.bucketName })
      .promise();
  }

  public async uploadFileToS3(
    filePath: fs.PathLike,
  ): Promise<S3.ManagedUpload.SendData> {
    const readableStream = fs.createReadStream(filePath);
    const key = nanoid();

    return this.uploadFileStream(key, readableStream);
  }

  public async getDataFromS3(filename: string): Promise<S3.Body> {
    const params = { Key: filename, Bucket: this.bucketName };

    const { Body: body } = await this.s3.getObject(params).promise();

    return body;
  }

  public async getSignedUrl(key: string): Promise<string> {
    return this.s3.getSignedUrlPromise('getObject', { Key: key });
  }
}
