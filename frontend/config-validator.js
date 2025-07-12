#!/usr/bin/env node

require('dotenv').config();

console.log('🔍 环境变量配置验证');
console.log('=====================================');

// 必需的环境变量
const requiredVars = [
  'DB_HOST',
  'DB_USER', 
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

// 可选的环境变量及其默认值
const optionalVars = {
  'DB_PORT': '3306',
  'PORT': '3001',
  'NODE_ENV': 'development',
  'FRONTEND_URL': 'http://localhost:3000',
  'UPLOAD_DIR': 'uploads',
  'MAX_FILE_SIZE': '10485760',
  'BCRYPT_ROUNDS': '10',
  'JWT_EXPIRES_IN': '24h',
  'LOG_LEVEL': 'info',
  'VERBOSE_LOGGING': 'true',
  'CORS_CREDENTIALS': 'true',
  'DB_CONNECTION_LIMIT': '10',
  'DB_QUEUE_LIMIT': '0'
};

let hasErrors = false;

// 检查必需的环境变量
console.log('\n📋 检查必需的环境变量:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: 未设置`);
    hasErrors = true;
  } else {
    // 隐藏敏感信息
    const displayValue = varName.includes('PASSWORD') || varName.includes('SECRET') 
      ? '*'.repeat(Math.min(value.length, 8)) 
      : value;
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

// 检查可选的环境变量
console.log('\n📋 检查可选的环境变量:');
Object.entries(optionalVars).forEach(([varName, defaultValue]) => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: 未设置 (使用默认值: ${defaultValue})`);
  } else {
    console.log(`✅ ${varName}: ${value}`);
  }
});

// 验证特定配置
console.log('\n🔧 配置验证:');

// 验证端口号
const port = process.env.PORT || 3001;
if (port < 1 || port > 65535) {
  console.log(`❌ PORT: 端口号必须在1-65535之间 (当前: ${port})`);
  hasErrors = true;
} else {
  console.log(`✅ PORT: 端口号有效 (${port})`);
}

// 验证文件大小
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760;
if (maxFileSize <= 0) {
  console.log(`❌ MAX_FILE_SIZE: 文件大小必须大于0 (当前: ${maxFileSize})`);
  hasErrors = true;
} else {
  console.log(`✅ MAX_FILE_SIZE: 文件大小有效 (${maxFileSize / 1024 / 1024}MB)`);
}

// 验证bcrypt轮数
const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
if (bcryptRounds < 1 || bcryptRounds > 20) {
  console.log(`❌ BCRYPT_ROUNDS: 轮数必须在1-20之间 (当前: ${bcryptRounds})`);
  hasErrors = true;
} else {
  console.log(`✅ BCRYPT_ROUNDS: 轮数有效 (${bcryptRounds})`);
}

// 验证JWT密钥长度
const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret && jwtSecret.length < 32) {
  console.log(`❌ JWT_SECRET: 密钥长度建议至少32个字符 (当前: ${jwtSecret.length})`);
  hasErrors = true;
} else if (jwtSecret) {
  console.log(`✅ JWT_SECRET: 密钥长度有效 (${jwtSecret.length}字符)`);
}

// 验证数据库连接配置
const dbConnectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT) || 10;
if (dbConnectionLimit < 1 || dbConnectionLimit > 100) {
  console.log(`❌ DB_CONNECTION_LIMIT: 连接数必须在1-100之间 (当前: ${dbConnectionLimit})`);
  hasErrors = true;
} else {
  console.log(`✅ DB_CONNECTION_LIMIT: 连接数有效 (${dbConnectionLimit})`);
}

// 验证文件类型
const allowedFileTypes = process.env.ALLOWED_FILE_TYPES;
if (allowedFileTypes) {
  const types = allowedFileTypes.split(',');
  console.log(`✅ ALLOWED_FILE_TYPES: 支持 ${types.length} 种文件类型`);
  console.log(`   支持的类型: ${types.join(', ')}`);
} else {
  console.log(`⚠️  ALLOWED_FILE_TYPES: 未设置 (使用默认类型)`);
}

console.log('\n=====================================');

if (hasErrors) {
  console.log('❌ 配置验证失败，请修复上述错误后重试');
  process.exit(1);
} else {
  console.log('✅ 配置验证通过！');
  console.log('\n💡 提示:');
  console.log('- 确保MySQL服务正在运行');
  console.log('- 检查数据库连接信息是否正确');
  console.log('- 生产环境请使用更强的JWT密钥');
  console.log('- 生产环境请设置 NODE_ENV=production');
}

console.log('\n🚀 可以启动服务器了！');
console.log('运行命令: npm start'); 