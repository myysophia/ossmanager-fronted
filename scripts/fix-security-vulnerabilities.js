#!/usr/bin/env node

/**
 * 安全漏洞修复脚本
 * 用于修复 CVE-2025-55182 和 CVE-2025-66478 漏洞
 * 
 * 执行方式：
 *   node scripts/fix-security-vulnerabilities.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 开始修复安全漏洞...\n');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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
    if (!options.ignoreError) {
      log(`❌ 命令执行失败: ${command}`, 'red');
      throw error;
    }
    return null;
  }
}

// Step 1: 检查当前版本
log('📋 步骤 1/5: 检查当前依赖版本...', 'blue');
try {
  const currentVersions = exec('npm list next react react-dom --depth=0', { silent: true, ignoreError: true });
  console.log(currentVersions || '无法获取当前版本信息');
} catch (error) {
  log('⚠️  无法获取当前版本，继续执行...', 'yellow');
}

// Step 2: 备份 package.json
log('\n📋 步骤 2/5: 备份 package.json...', 'blue');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const backupPath = path.join(process.cwd(), `package.json.backup.${Date.now()}`);

try {
  fs.copyFileSync(packageJsonPath, backupPath);
  log(`✅ 已备份到: ${backupPath}`, 'green');
} catch (error) {
  log('❌ 备份失败，终止执行', 'red');
  process.exit(1);
}

// Step 3: 读取并更新 package.json
log('\n📋 步骤 3/5: 更新 package.json 版本...', 'blue');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  const updates = {
    'next': '15.2.6',
    'react': '^19.0.1',
    'react-dom': '^19.0.1',
  };
  
  let hasChanges = false;
  for (const [pkg, version] of Object.entries(updates)) {
    if (packageJson.dependencies[pkg]) {
      const oldVersion = packageJson.dependencies[pkg];
      packageJson.dependencies[pkg] = version;
      log(`  ${pkg}: ${oldVersion} → ${version}`, 'yellow');
      hasChanges = true;
    }
  }
  
  if (hasChanges) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    log('✅ package.json 已更新', 'green');
  } else {
    log('ℹ️  未发现需要更新的依赖', 'yellow');
  }
} catch (error) {
  log(`❌ 更新 package.json 失败: ${error.message}`, 'red');
  log(`⚠️  正在恢复备份...`, 'yellow');
  fs.copyFileSync(backupPath, packageJsonPath);
  process.exit(1);
}

// Step 4: 删除现有依赖并重新安装
log('\n📋 步骤 4/5: 重新安装依赖...', 'blue');
log('  这可能需要几分钟时间，请耐心等待...', 'yellow');

try {
  // 删除 node_modules 和 lock 文件
  log('  清理现有依赖...', 'yellow');
  if (fs.existsSync('node_modules')) {
    exec('rm -rf node_modules', { ignoreError: true });
  }
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }
  
  // 重新安装
  log('  安装新版本依赖...', 'yellow');
  exec('npm install');
  log('✅ 依赖安装完成', 'green');
} catch (error) {
  log('❌ 安装依赖失败', 'red');
  log(`⚠️  正在恢复备份...`, 'yellow');
  fs.copyFileSync(backupPath, packageJsonPath);
  process.exit(1);
}

// Step 5: 验证版本
log('\n📋 步骤 5/5: 验证新版本...', 'blue');
try {
  const newVersions = exec('npm list next react react-dom --depth=0', { silent: true, ignoreError: true });
  console.log(newVersions || '无法获取版本信息');
  
  // 检查是否有已知漏洞
  log('\n🔍 运行安全审计...', 'blue');
  const auditResult = exec('npm audit --audit-level=high', { silent: true, ignoreError: true });
  
  if (auditResult && auditResult.includes('found 0 vulnerabilities')) {
    log('✅ 未发现高危漏洞', 'green');
  } else {
    log('⚠️  可能仍存在其他漏洞，请查看审计报告', 'yellow');
    console.log(auditResult);
  }
} catch (error) {
  log('⚠️  验证步骤出现问题，但安装可能已完成', 'yellow');
}

// 完成
log('\n' + '='.repeat(60), 'green');
log('✅ 安全漏洞修复完成！', 'green');
log('='.repeat(60), 'green');

log('\n📝 后续步骤:', 'blue');
log('  1. 运行测试: npm run dev', 'yellow');
log('  2. 检查应用是否正常运行', 'yellow');
log('  3. 查看完整安全报告: docs/安全漏洞分析报告-CVE-2025-55182-66478.md', 'yellow');
log('  4. 考虑实施报告中的安全加固建议', 'yellow');

log('\n💾 备份文件保存在:', 'blue');
log(`  ${backupPath}`, 'yellow');
log('  如果遇到问题，可以使用备份恢复\n', 'yellow');

