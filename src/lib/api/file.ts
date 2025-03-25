import apiClient from './axios';
import { ApiResponse, FileUploadResponse } from './types';

export const FileAPI = {
  /**
   * 上传文件
   * @param file 文件对象或 FormData
   * @returns 上传成功的文件信息
   */
  uploadFile: async (file: File | FormData): Promise<FileUploadResponse> => {
    const formData = file instanceof FormData ? file : (() => {
      const fd = new FormData();
      fd.append('file', file);
      return fd;
    })();

    const response = await apiClient.post<ApiResponse<FileUploadResponse>>('/oss/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data?.data) {
      throw new Error('上传响应为空');
    }

    return response.data.data;
  },

  /**
   * 删除文件
   * @param id 文件ID
   */
  deleteFile: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/oss/files/${id}`);
  },
}; 