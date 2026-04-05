import { StorageService } from './storage.service';

jest.mock('@google-cloud/storage', () => {
  return {
    Storage: jest.fn().mockImplementation(() => ({
      bucket: jest.fn().mockReturnValue({
        file: jest.fn().mockReturnValue({
          save: jest.fn(),
          download: jest.fn(),
          delete: jest.fn(),
        }),
      }),
      getBuckets: jest.fn(),
    })),
  };
});

describe('StorageService', () => {
  let service: StorageService;
  let storageMock: { bucket: jest.Mock; getBuckets: jest.Mock };
  const projectId = 'test-project';

  beforeEach(() => {
    service = new StorageService(projectId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    storageMock = (service as any).storage as {
      bucket: jest.Mock;
      getBuckets: jest.Mock;
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBucket', () => {
    it('should return a bucket instance', async () => {
      const bucketName = 'test-bucket';
      const bucketMock = { name: bucketName };
      storageMock.bucket.mockReturnValue(bucketMock);

      const result = await service.getBucket(bucketName);

      expect(result).toBe(bucketMock);
      expect(storageMock.bucket).toHaveBeenCalledWith(bucketName);
    });
  });

  describe('listBuckets', () => {
    it('should list all buckets', async () => {
      const bucketMocks = [{ name: 'b1' }, { name: 'b2' }];
      storageMock.getBuckets.mockResolvedValue([bucketMocks]);

      const result = await service.listBuckets();

      expect(result).toBe(bucketMocks);
      expect(storageMock.getBuckets).toHaveBeenCalled();
    });

    it('should throw error if listing fails', async () => {
      const error = new Error('Listing failed');
      storageMock.getBuckets.mockRejectedValue(error);

      await expect(service.listBuckets()).rejects.toThrow(error);
    });
  });

  describe('uploadFile', () => {
    it('should upload a file to a bucket', async () => {
      const bucketName = 'test-bucket';
      const fileName = 'test.txt';
      const buffer = Buffer.from('hello');
      const fileMock = { save: jest.fn().mockResolvedValue({}) };
      const bucketMock = { file: jest.fn().mockReturnValue(fileMock) };
      storageMock.bucket.mockReturnValue(bucketMock);

      await service.uploadFile(bucketName, fileName, buffer);

      expect(storageMock.bucket).toHaveBeenCalledWith(bucketName);
      expect(bucketMock.file).toHaveBeenCalledWith(fileName);
      expect(fileMock.save).toHaveBeenCalledWith(buffer);
    });

    it('should throw error if upload fails', async () => {
      const bucketName = 'test-bucket';
      const fileName = 'test.txt';
      const buffer = Buffer.from('hello');
      const error = new Error('Upload failed');
      const fileMock = { save: jest.fn().mockRejectedValue(error) };
      const bucketMock = { file: jest.fn().mockReturnValue(fileMock) };
      storageMock.bucket.mockReturnValue(bucketMock);

      await expect(
        service.uploadFile(bucketName, fileName, buffer),
      ).rejects.toThrow(error);
    });
  });

  describe('downloadFile', () => {
    it('should download a file as a Buffer', async () => {
      const bucketName = 'test-bucket';
      const fileName = 'test.txt';
      const buffer = Buffer.from('hello');
      const fileMock = { download: jest.fn().mockResolvedValue([buffer]) };
      const bucketMock = { file: jest.fn().mockReturnValue(fileMock) };
      storageMock.bucket.mockReturnValue(bucketMock);

      const result = await service.downloadFile(bucketName, fileName);

      expect(result).toBe(buffer);
      expect(storageMock.bucket).toHaveBeenCalledWith(bucketName);
      expect(bucketMock.file).toHaveBeenCalledWith(fileName);
    });

    it('should throw error if download fails', async () => {
      const bucketName = 'test-bucket';
      const fileName = 'test.txt';
      const error = new Error('Download failed');
      const fileMock = { download: jest.fn().mockRejectedValue(error) };
      const bucketMock = { file: jest.fn().mockReturnValue(fileMock) };
      storageMock.bucket.mockReturnValue(bucketMock);

      await expect(service.downloadFile(bucketName, fileName)).rejects.toThrow(
        error,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file from a bucket', async () => {
      const bucketName = 'test-bucket';
      const fileName = 'test.txt';
      const fileMock = { delete: jest.fn().mockResolvedValue({}) };
      const bucketMock = { file: jest.fn().mockReturnValue(fileMock) };
      storageMock.bucket.mockReturnValue(bucketMock);

      await service.deleteFile(bucketName, fileName);

      expect(storageMock.bucket).toHaveBeenCalledWith(bucketName);
      expect(bucketMock.file).toHaveBeenCalledWith(fileName);
      expect(fileMock.delete).toHaveBeenCalled();
    });

    it('should throw error if deletion fails', async () => {
      const bucketName = 'test-bucket';
      const fileName = 'test.txt';
      const error = new Error('Deletion failed');
      const fileMock = { delete: jest.fn().mockRejectedValue(error) };
      const bucketMock = { file: jest.fn().mockReturnValue(fileMock) };
      storageMock.bucket.mockReturnValue(bucketMock);

      await expect(service.deleteFile(bucketName, fileName)).rejects.toThrow(
        error,
      );
    });
  });
});
