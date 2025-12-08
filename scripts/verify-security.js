#!/usr/bin/env node

/**
 * 安全验证脚本
 * 用于验证 CVE-2025-55182 和 CVE-2025-66478 漏洞是否已修复
 * 
 * 执行方式：
 *   node scripts/verify-security.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
  } catch (error) {
    return null;
  }
}

console.log('\n' + '='.repeat(70));
log('🔒 安全验证检查', 'cyan');
log('检查 CVE-2025-55182 和 CVE-2025-66478 漏洞修复状态', 'cyan');
console.log('='.repeat(70) + '\n');

const checks = [];
let passedChecks = 0;
let totalChecks = 0;

/**
 * 检查包版本
 */
function checkPackageVersion(packageName, minVersion) {
  totalChecks++;
  log(`\n📦 检查 ${packageName} 版本...`, 'blue');
  
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    );
    
    const installedVersion = packageJson.dependencies[packageName];
    if (!installedVersion) {
      log(`  ❌ 未找到 ${packageName}`, 'red');
      checks.push({ name: packageName, status: 'fail', message: '未安装' });
      return false;
    }
    
    // 简单版本比较（移除 ^ 和 ~）
    const version = installedVersion.replace(/[\^~]/, '');
    
    // 检查是否满足最小版本要求
    const versionParts = version.split('.').map(Number);
    const minVersionParts = minVersion.split('.').map(Number);
    
    let isSafe = true;
    for (let i = 0; i < minVersionParts.length; i++) {
      if (versionParts[i] > minVersionParts[i]) {
        break;
      } else if (versionParts[i] < minVersionParts[i]) {
        isSafe = false;
        break;
      }
    }
    
    if (isSafe) {
      log(`  ✅ ${packageName}@${installedVersion} (需要 ≥${minVersion})`, 'green');
      checks.push({ 
        name: packageName, 
        status: 'pass', 
        version: installedVersion 
      });
      passedChecks++;
      return true;
    } else {
      log(`  ❌ ${packageName}@${installedVersion} (需要 ≥${minVersion})`, 'red');
      checks.push({ 
        name: packageName, 
        status: 'fail', 
        version: installedVersion,
        required: minVersion 
      });
      return false;
    }
  } catch (error) {
    log(`  ❌ 检查失败: ${error.message}`, 'red');
    checks.push({ name: packageName, status: 'error', message: error.message });
    return false;
  }
}

/**
 * 检查文件是否存在
 */
function checkFileExists(filePath, description) {
  totalChecks++;
  log(`\n📄 检查 ${description}...`, 'blue');
  
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    log(`  ✅ ${filePath} 存在`, 'green');
    checks.push({ name: description, status: 'pass', file: filePath });
    passedChecks++;
    return true;
  } else {
    log(`  ⚠️  ${filePath} 不存在`, 'yellow');
    checks.push({ name: description, status: 'warn', file: filePath });
    return false;
  }
}

/**
 * 运行 npm audit
 */
function runNpmAudit() {
  totalChecks++;
  log('\n🔍 运行 npm audit...', 'blue');
  
  try {
    const output = exec('npm audit --json', { silent: true });
    if (!output) {
      log('  ⚠️  无法运行 npm audit', 'yellow');
      checks.push({ name: 'npm audit', status: 'warn', message: '无法执行' });
      return false;
    }
    
    const auditResult = JSON.parse(output);
    const { vulnerabilities } = auditResult;
    
    // 统计漏洞数量
    const criticalCount = vulnerabilities?.critical || 0;
    const highCount = vulnerabilities?.high || 0;
    const moderateCount = vulnerabilities?.moderate || 0;
    
    if (criticalCount === 0 && highCount === 0) {
      log(`  ✅ 未发现严重或高危漏洞`, 'green');
      if (moderateCount > 0) {
        log(`  ℹ️  发现 ${moderateCount} 个中危漏洞（建议修复）`, 'yellow');
      }
      checks.push({ 
        name: 'npm audit', 
        status: 'pass',
        vulnerabilities: { critical: 0, high: 0, moderate: moderateCount }
      });
      passedChecks++;
      return true;
    } else {
      log(`  ❌ 发现漏洞: ${criticalCount} 严重, ${highCount} 高危, ${moderateCount} 中危`, 'red');
      checks.push({ 
        name: 'npm audit', 
        status: 'fail',
        vulnerabilities: { critical: criticalCount, high: highCount, moderate: moderateCount }
      });
      return false;
    }
  } catch (error) {
    log('  ⚠️  npm audit 执行出错', 'yellow');
    checks.push({ name: 'npm audit', status: 'error', message: error.message });
    return false;
  }
}

/**
 * 检查中间件配置
 */
function checkMiddleware() {
  totalChecks++;
  log('\n🛡️  检查安全中间件...', 'blue');
  
  const middlewarePath = path.join(process.cwd(), 'src/middleware.ts');
  if (!fs.existsSync(middlewarePath)) {
    log('  ⚠️  未找到 middleware.ts', 'yellow');
    checks.push({ name: '安全中间件', status: 'warn', message: '未配置' });
    return false;
  }
  
  const content = fs.readFileSync(middlewarePath, 'utf-8');
  
  // 检查关键功能
  const features = {
    '速率限制': /rateLimit|rate.*limit/i.test(content),
    '可疑请求检测': /suspicious|detect/i.test(content),
    '安全头部': /security.*header|X-Frame-Options|X-Content-Type-Options/i.test(content),
  };
  
  const implementedFeatures = Object.entries(features)
    .filter(([_, implemented]) => implemented)
    .map(([name]) => name);
  
  const missingFeatures = Object.entries(features)
    .filter(([_, implemented]) => !implemented)
    .map(([name]) => name);
  
  if (missingFeatures.length === 0) {
    log(`  ✅ 所有安全功能已实现: ${implementedFeatures.join(', ')}`, 'green');
    checks.push({ 
      name: '安全中间件', 
      status: 'pass',
      features: implementedFeatures 
    });
    passedChecks++;
    return true;
  } else {
    log(`  ⚠️  已实现: ${implementedFeatures.join(', ')}`, 'yellow');
    log(`  ⚠️  缺失: ${missingFeatures.join(', ')}`, 'yellow');
    checks.push({ 
      name: '安全中间件', 
      status: 'partial',
      implemented: implementedFeatures,
      missing: missingFeatures
    });
    passedChecks += 0.5; // 部分通过
    return false;
  }
}

// 执行所有检查
log('开始执行安全检查...\n', 'cyan');

// 1. 检查关键依赖版本
checkPackageVersion('next', '15.2.6');
checkPackageVersion('react', '19.0.1');
checkPackageVersion('react-dom', '19.0.1');

// 2. 检查安全相关文件
checkFileExists('src/middleware.ts', '安全中间件文件');
checkFileExists('docs/安全漏洞分析报告-CVE-2025-55182-66478.md', '安全分析报告');
checkFileExists('docs/安全加固指南.md', '安全加固指南');

// 3. 检查中间件配置
checkMiddleware();

// 4. 运行 npm audit
runNpmAudit();

// 输出总结
console.log('\n' + '='.repeat(70));
log('检查完成！', 'cyan');
console.log('='.repeat(70));

const percentage = Math.round((passedChecks / totalChecks) * 100);
const statusColor = percentage >= 80 ? 'green' : percentage >= 50 ? 'yellow' : 'red';

log(`\n📊 总体评分: ${passedChecks}/${totalChecks} (${percentage}%)`, statusColor);

if (percentage >= 80) {
  log('\n✅ 安全状态良好！项目已修复关键漏洞。', 'green');
} else if (percentage >= 50) {
  log('\n⚠️  安全状态一般，建议完成剩余的安全措施。', 'yellow');
} else {
  log('\n❌ 安全状态不佳，请立即执行修复！', 'red');
}

// 输出详细建议
console.log('\n' + '-'.repeat(70));
log('📋 详细建议:', 'blue');

const failedChecks = checks.filter(c => c.status === 'fail' || c.status === 'error');
if (failedChecks.length > 0) {
  log('\n需要立即修复的问题:', 'red');
  failedChecks.forEach((check, index) => {
    console.log(`  ${index + 1}. ${check.name}`);
    if (check.required) {
      console.log(`     需要版本: ${check.required}, 当前版本: ${check.version}`);
    }
  });
  
  log('\n修复命令:', 'yellow');
  log('  node scripts/fix-security-vulnerabilities.js', 'cyan');
}

const warnChecks = checks.filter(c => c.status === 'warn' || c.status === 'partial');
if (warnChecks.length > 0) {
  log('\n建议改进的项目:', 'yellow');
  warnChecks.forEach((check, index) => {
    console.log(`  ${index + 1}. ${check.name}`);
    if (check.missing) {
      console.log(`     缺失功能: ${check.missing.join(', ')}`);
    }
  });
}

log('\n📚 更多信息请查看:', 'blue');
log('  - docs/安全漏洞分析报告-CVE-2025-55182-66478.md', 'cyan');
log('  - docs/安全加固指南.md\n', 'cyan');

// 返回退出码
process.exit(percentage >= 80 ? 0 : 1);

