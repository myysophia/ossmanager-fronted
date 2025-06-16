import apiClient from './axios';
import { ApiResponse, FileDownloadResponse, FileQueryParams, FileUploadResponse, MultipartCompleteParams, MultipartInitResponse, OSSFile, PageResponse } from './types';

/**
 * OSS文件相关API服务
 */
export const FileAPI = {
  /**
   * 获取文件列表
   * @param params 查询参数
   * @returns 文件列表及分页信息
   */
  getFiles: async (params?: FileQueryParams): Promise<PageResponse<OSSFile>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<OSSFile>>>('/oss/files', { params });
    return response.data as unknown as PageResponse<OSSFile>;
  },

  /**
   * 上传文件
   * @param file 文件对象或 FormData
   * @param options 额外header参数
   * @returns 上传成功的文件信息
   */
  uploadFile: async (
    file: File | FormData,
    options?: { regionCode?: string; bucketName?: string }
  ): Promise<FileUploadResponse> => {
    const formData = file instanceof FormData ? file : (() => {
      const fd = new FormData();
      fd.append('file', file);
      return fd;
    })();

    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };
    if (options?.regionCode) headers['region_code'] = options.regionCode;
    if (options?.bucketName) headers['bucket_name'] = options.bucketName;

    const response = await apiClient.post<ApiResponse<FileUploadResponse>>('/oss/files', formData, {
      headers,
    });

    // if (!response.data?.data) {
    //   throw new Error('上传响应为空');
    // }

    return response.data.data;
  },

  /**
   * 初始化分片上传
   * @param filename 文件名
   * @param storageType 存储类型
   * @returns 上传ID和分片上传URL列表
   */
  initMultipartUpload: async (filename: string, storageType?: string): Promise<MultipartInitResponse> => {
    const response = await apiClient.post<ApiResponse<MultipartInitResponse>>('/oss/multipart/init', null, {
      params: {
        filename,
        storage_type: storageType,
      },
    });
    
    return response.data as unknown as MultipartInitResponse;
  },

  /**
   * 完成分片上传
   * @param params 完成参数
   * @returns 上传后的文件信息
   */
  completeMultipartUpload: async (params: MultipartCompleteParams): Promise<OSSFile> => {
    const response = await apiClient.post<ApiResponse<OSSFile>>('/oss/multipart/complete', params);
    return response.data as unknown as OSSFile;
  },

  /**
   * 取消分片上传
   * @param uploadId 上传ID
   * @param filename 文件名
   * @param storageType 存储类型
   */
  abortMultipartUpload: async (uploadId: string, filename: string, storageType?: string): Promise<void> => {
    await apiClient.delete('/oss/multipart/abort', {
      params: {
        upload_id: uploadId,
        filename,
        storage_type: storageType,
      },
    });
  },

  /**
   * 获取文件下载链接
   * @param id 文件ID
   * @returns 下载链接和过期时间
   */
  getFileDownloadURL: async (id: number): Promise<FileDownloadResponse> => {
    const response = await apiClient.get<ApiResponse<FileDownloadResponse>>(`/oss/files/${id}/download`);
    return response.data as unknown as FileDownloadResponse;
  },

  /**
   * 触发MD5计算
   * @param id 文件ID
   */
  triggerMD5Calculation: async (id: number): Promise<void> => {
    await apiClient.post<ApiResponse>(`/oss/files/${id}/md5`);
  },

  /**
   * 获取文件MD5值
   * @param id 文件ID
   * @returns MD5值及计算状态
   */
  getFileMD5: async (id: number): Promise<{ md5: string; status: string }> => {
    const response = await apiClient.get<ApiResponse<{ md5: string; status: string }>>(`/oss/files/${id}/md5`);
    return response.data as unknown as { md5: string; status: string };
  },

  /**
   * 删除文件
   * @param id 文件ID
   */
  deleteFile: async (id: number): Promise<void> => {
    await apiClient.delete<ApiResponse>(`/oss/files/${id}`);
  },
}; 