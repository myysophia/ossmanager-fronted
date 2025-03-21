// 存储配置和系统配置的数据访问层
// 在实际应用中，这里应该是与数据库交互的代码

import { v4 as uuidv4 } from 'uuid';

// 存储配置模型
export interface StorageConfig {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  isDefault: boolean;
}

// 系统配置模型
export interface SystemConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  maxUploadConcurrency: number;
  enablePublicAccess: boolean;
  retentionDays: number;
}

// 存储配置数据
// 在实际应用中，这应该存储在数据库中
export let storageConfigs: StorageConfig[] = [
  {
    id: '1',
    name: '本地存储',
    type: 'local',
    endpoint: 'http://localhost:3000/storage',
    accessKey: 'localkey',
    secretKey: 'localsecret',
    bucket: 'local-bucket',
    region: 'local',
    isDefault: true,
  },
  {
    id: '2',
    name: '阿里云OSS',
    type: 'oss',
    endpoint: 'https://oss-cn-beijing.aliyuncs.com',
    accessKey: 'alioss-key',
    secretKey: 'alioss-secret',
    bucket: 'alioss-bucket',
    region: 'cn-beijing',
    isDefault: false,
  },
];

// 系统配置数据
// 在实际应用中，这应该存储在数据库中
export let systemConfig: SystemConfig = {
  maxFileSize: 100, // MB
  allowedFileTypes: ['jpg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
  maxUploadConcurrency: 5,
  enablePublicAccess: true,
  retentionDays: 30,
};

// 存储配置相关方法
export const StorageConfigService = {
  // 获取所有存储配置
  getAllConfigs: () => {
    return storageConfigs;
  },
  
  // 获取单个存储配置
  getConfigById: (id: string) => {
    return storageConfigs.find(config => config.id === id);
  },
  
  // 创建新的存储配置
  createConfig: (config: Omit<StorageConfig, 'id'>) => {
    const newConfig: StorageConfig = {
      id: uuidv4(),
      ...config,
    };
    
    // 如果是默认配置，将其他配置设为非默认
    if (newConfig.isDefault) {
      storageConfigs = storageConfigs.map(config => ({
        ...config,
        isDefault: false,
      }));
    }
    
    storageConfigs.push(newConfig);
    return newConfig;
  },
  
  // 更新存储配置
  updateConfig: (id: string, updates: Partial<Omit<StorageConfig, 'id'>>) => {
    const configIndex = storageConfigs.findIndex(config => config.id === id);
    if (configIndex === -1) return null;
    
    // 如果设置为默认，将其他配置设为非默认
    if (updates.isDefault) {
      storageConfigs = storageConfigs.map(config => ({
        ...config,
        isDefault: config.id === id,
      }));
    }
    
    const updatedConfig = {
      ...storageConfigs[configIndex],
      ...updates,
    };
    
    storageConfigs[configIndex] = updatedConfig;
    return updatedConfig;
  },
  
  // 删除存储配置
  deleteConfig: (id: string) => {
    const configIndex = storageConfigs.findIndex(config => config.id === id);
    if (configIndex === -1) return false;
    
    // 不允许删除默认配置
    if (storageConfigs[configIndex].isDefault) {
      return false;
    }
    
    storageConfigs.splice(configIndex, 1);
    return true;
  },
  
  // 获取默认配置
  getDefaultConfig: () => {
    return storageConfigs.find(config => config.isDefault);
  },
};

// 系统配置相关方法
export const SystemConfigService = {
  // 获取系统配置
  getConfig: () => {
    return systemConfig;
  },
  
  // 更新系统配置
  updateConfig: (updates: Partial<SystemConfig>) => {
    systemConfig = {
      ...systemConfig,
      ...updates,
    };
    return systemConfig;
  },
}; 