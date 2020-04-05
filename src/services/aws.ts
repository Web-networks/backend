import AWS, { S3, AWSError } from 'aws-sdk';
import config from 'config';
import uuid from 'uuid/v4';

interface FileType {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}

export class Aws {
    private readonly bucket: string;
    private readonly endpointUrl: string;
    private readonly s3: S3;

    constructor() {
        this.bucket = config.get('aws.bucket');
        this.endpointUrl = config.get('aws.endpoint');
        this.s3 = new AWS.S3({
            endpoint: this.endpointUrl,
            region: config.get('aws.region'),
        });
    }

    public async uploadUserPhoto(file: FileType, username: string): Promise<string> {
        const fileId = uuid();
        const userDir = `users/${username}`;
        const nextPhotoPath = `${userDir}/${fileId}`;
        await this.deleteDir(userDir);
        return this.uploadFile(file, nextPhotoPath);
    }

    private async uploadFile(file: FileType, path: string): Promise<string> {
        const params: S3.Types.PutObjectRequest = {
            Bucket: this.bucket,
            Body: file.buffer,
            Key: path,
            ContentType: file.mimetype,
        };
        const uri = `${this.endpointUrl}/${this.bucket}/${path}`;
        return new Promise((resolve, reject) => {
            this.s3.putObject(params, (err: AWSError, _: S3.PutObjectOutput) => {
                if (err) {
                    reject(err);
                }
                resolve(uri);
            });
        });
    }

    private async deleteDir(path: string): Promise<void> {
        const findParams: S3.Types.ListObjectsV2Request = {
            Bucket: this.bucket,
            Prefix: path,
        };
        return new Promise((resolve, reject) => {
            this.s3.listObjectsV2(findParams, (err, data) => {
                if (err) {
                    reject(err);
                }
                // eslint-disable-next-line no-unused-expressions
                data.Contents?.forEach(({ Key }) => {
                    if (!Key) {
                        return;
                    }
                    const params: S3.Types.PutObjectRequest = {
                        Bucket: this.bucket,
                        Key,
                    };
                    this.s3.deleteObject(params, (err: AWSError, _: S3.PutObjectOutput) => {
                        if (err) {
                            reject(err);
                        }
                    });
                });
                resolve();
            });
        });
    }
}
