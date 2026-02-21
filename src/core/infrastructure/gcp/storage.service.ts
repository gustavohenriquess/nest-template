import { Logger } from '@nestjs/common';
import { Storage, Bucket } from '@google-cloud/storage';

export class StorageService {
    private storage: Storage;
    private readonly logger = new Logger(StorageService.name);

    constructor(projectId: string) {
        this.storage = new Storage({ projectId });
        this.logger.log(`StorageService initialized for project: ${projectId}`);
    }

    async getBucket(bucketName: string): Promise<Bucket> {
        return this.storage.bucket(bucketName);
    }

    async listBuckets() {
        try {
            const [buckets] = await this.storage.getBuckets();
            return buckets;
        } catch (error) {
            this.logger.error(`Error listing buckets:`, error.message);
            throw error;
        }
    }

    async uploadFile(bucketName: string, destFileName: string, fileBuffer: Buffer) {
        try {
            const bucket = this.storage.bucket(bucketName);
            const file = bucket.file(destFileName);
            await file.save(fileBuffer);
            this.logger.log(`File ${destFileName} uploaded to ${bucketName}.`);
        } catch (error) {
            this.logger.error(`Error uploading file to ${bucketName}:`, error.message);
            throw error;
        }
    }

    async downloadFile(bucketName: string, fileName: string): Promise<Buffer> {
        try {
            const [content] = await this.storage.bucket(bucketName).file(fileName).download();
            this.logger.log(`File ${fileName} downloaded from ${bucketName}.`);
            return content;
        } catch (error) {
            this.logger.error(`Error downloading file ${fileName} from ${bucketName}:`, error.message);
            throw error;
        }
    }

    async deleteFile(bucketName: string, fileName: string) {
        try {
            await this.storage.bucket(bucketName).file(fileName).delete();
            this.logger.log(`File ${fileName} deleted from ${bucketName}.`);
        } catch (error) {
            this.logger.error(`Error deleting file from ${bucketName}:`, error.message);
            throw error;
        }
    }
}
