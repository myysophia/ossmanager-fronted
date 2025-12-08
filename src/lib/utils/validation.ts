// 输入验证和清理工具

// 安全配置
const SECURITY_RULES = {
  // 最大字符串长度
  maxStringLength: 1000,
  maxNameLength: 100,
  maxEmailLength: 254,
  maxPasswordLength: 128,
  
  // 危险字符模式
  dangerousChars: /[<>\"'&\/\\]/g,
  scriptPattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  sqlInjectionPattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|OR|AND)\b)|('|('')|;|--|\/\*|\*\/)/gi,
  
  // HTML实体映射
  htmlEntities: {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '&': '&amp;',
    '/': '&#x2F;',
    '\\': '&#x5C;'
  }
};

// HTML转义
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input.replace(SECURITY_RULES.dangerousChars, (match) => {
    return SECURITY_RULES.htmlEntities[match as keyof typeof SECURITY_RULES.htmlEntities] || match;
  });
}

// 移除HTML标签
export function stripHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/<[^>]*>/g, '') // 移除HTML标签
    .replace(/&[a-zA-Z0-9#]+;/g, '') // 移除HTML实体
    .trim();
}

// 清理JavaScript代码
export function removeScripts(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(SECURITY_RULES.scriptPattern, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// 清理SQL注入尝试
export function sanitizeSql(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input.replace(SECURITY_RULES.sqlInjectionPattern, '');
}

// 通用输入清理
export function sanitizeInput(input: string, options: {
  maxLength?: number;
  allowHtml?: boolean;
  removeScripts?: boolean;
  preventSqlInjection?: boolean;
} = {}): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  let sanitized = input.trim();
  
  // 长度限制
  const maxLength = options.maxLength || SECURITY_RULES.maxStringLength;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // 移除脚本
  if (options.removeScripts !== false) {
    sanitized = removeScripts(sanitized);
  }
  
  // 防止SQL注入
  if (options.preventSqlInjection !== false) {
    sanitized = sanitizeSql(sanitized);
  }
  
  // HTML处理
  if (!options.allowHtml) {
    sanitized = stripHtml(sanitized);
  } else {
    sanitized = escapeHtml(sanitized);
  }
  
  return sanitized;
}

// 验证邮箱格式
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: '邮箱不能为空' };
  }
  
  if (email.length > SECURITY_RULES.maxEmailLength) {
    return { isValid: false, error: '邮箱地址过长' };
  }
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '邮箱格式不正确' };
  }
  
  return { isValid: true };
}

// 验证用户名
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (!username || typeof username !== 'string') {
    return { isValid: false, error: '用户名不能为空' };
  }
  
  const sanitized = sanitizeInput(username, { maxLength: SECURITY_RULES.maxNameLength });
  
  if (sanitized.length < 3) {
    return { isValid: false, error: '用户名至少需要3个字符' };
  }
  
  if (sanitized.length > SECURITY_RULES.maxNameLength) {
    return { isValid: false, error: `用户名不能超过${SECURITY_RULES.maxNameLength}个字符` };
  }
  
  // 只允许字母、数字、下划线、连字符
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(sanitized)) {
    return { isValid: false, error: '用户名只能包含字母、数字、下划线和连字符' };
  }
  
  return { isValid: true };
}

// 验证密码强度
export function validatePassword(password: string): { isValid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: '密码不能为空', strength: 'weak' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: '密码至少需要8个字符', strength: 'weak' };
  }
  
  if (password.length > SECURITY_RULES.maxPasswordLength) {
    return { isValid: false, error: `密码不能超过${SECURITY_RULES.maxPasswordLength}个字符`, strength: 'weak' };
  }
  
  // 检查密码强度
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;
  
  if (/[a-z]/.test(password)) score++; // 小写字母
  if (/[A-Z]/.test(password)) score++; // 大写字母
  if (/[0-9]/.test(password)) score++; // 数字
  if (/[^a-zA-Z0-9]/.test(password)) score++; // 特殊字符
  
  if (score >= 4 && password.length >= 12) {
    strength = 'strong';
  } else if (score >= 3 && password.length >= 10) {
    strength = 'medium';
  }
  
  if (strength === 'weak') {
    return { 
      isValid: false, 
      error: '密码强度不足，需要包含大小写字母、数字和特殊字符', 
      strength 
    };
  }
  
  return { isValid: true, strength };
}

// 验证文件名
export function validateFileName(fileName: string): { isValid: boolean; error?: string; sanitized?: string } {
  if (!fileName || typeof fileName !== 'string') {
    return { isValid: false, error: '文件名不能为空' };
  }
  
  // 清理文件名
  let sanitized = fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // 替换危险字符
    .replace(/^\.+/, '') // 移除开头的点
    .replace(/\s+/g, '_') // 替换空格
    .substring(0, 255); // 限制长度
  
  if (!sanitized) {
    return { isValid: false, error: '文件名无效' };
  }
  
  // 检查是否包含危险扩展名
  const dangerousExtensions = [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.sh', '.php', '.asp', '.aspx', '.jsp', '.pl', '.py', '.rb'
  ];
  
  const extension = '.' + sanitized.split('.').pop()?.toLowerCase();
  if (dangerousExtensions.includes(extension)) {
    return { isValid: false, error: '不允许的文件类型' };
  }
  
  return { isValid: true, sanitized };
}

// 验证URL
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL不能为空' };
  }
  
  try {
    const urlObj = new URL(url);
    
    // 只允许HTTP和HTTPS协议
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: '只支持HTTP和HTTPS协议' };
    }
    
    // 检查是否是本地网络地址
    const hostname = urlObj.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    const isPrivateIP = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname);
    
    if (process.env.NODE_ENV === 'production' && (isLocalhost || isPrivateIP)) {
      return { isValid: false, error: '不允许访问内网地址' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'URL格式不正确' };
  }
}

// 通用表单验证
export interface FormValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: 'email' | 'username' | 'password' | 'url' | 'filename' | 'text';
  custom?: (value: any) => { isValid: boolean; error?: string };
}

export function validateForm(data: Record<string, any>, rules: Record<string, FormValidationRule>): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, any>;
} {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, any> = {};
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    
    // 必填验证
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field}是必填项`;
      continue;
    }
    
    // 如果值为空且不是必填，跳过验证
    if (!value && !rule.required) {
      sanitizedData[field] = value;
      continue;
    }
    
    // 类型特定验证
    if (rule.type && typeof value === 'string') {
      let validationResult;
      
      switch (rule.type) {
        case 'email':
          validationResult = validateEmail(value);
          break;
        case 'username':
          validationResult = validateUsername(value);
          break;
        case 'password':
          validationResult = validatePassword(value);
          break;
        case 'url':
          validationResult = validateUrl(value);
          break;
        case 'filename':
          validationResult = validateFileName(value);
          if (validationResult.isValid && validationResult.sanitized) {
            sanitizedData[field] = validationResult.sanitized;
          }
          break;
        default:
          sanitizedData[field] = sanitizeInput(value, { maxLength: rule.maxLength });
          validationResult = { isValid: true };
      }
      
      if (!validationResult.isValid) {
        errors[field] = validationResult.error || `${field}格式不正确`;
        continue;
      }
    }
    
    // 长度验证
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `${field}至少需要${rule.minLength}个字符`;
        continue;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${field}不能超过${rule.maxLength}个字符`;
        continue;
      }
    }
    
    // 模式验证
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors[field] = `${field}格式不正确`;
      continue;
    }
    
    // 自定义验证
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (!customResult.isValid) {
        errors[field] = customResult.error || `${field}验证失败`;
        continue;
      }
    }
    
    // 如果没有在类型验证中处理，进行默认清理
    if (rule.type !== 'filename') {
      if (typeof value === 'string') {
        sanitizedData[field] = sanitizeInput(value, { maxLength: rule.maxLength });
      } else {
        sanitizedData[field] = value;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
} 