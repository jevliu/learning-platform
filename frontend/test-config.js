#!/usr/bin/env node

require('dotenv').config();

console.log('🧪 配置测试脚本');
console.log('=====================================');

// 测试数据库连接
async function testDatabaseConnection() {
  console.log('\n📊 测试数据库连接...');
  
  try {
    const mysql = require('mysql2/promise');
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    
    // 测试查询
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ 数据库查询测试通过');
    
    connection.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.log('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 测试JWT配置
function testJWTConfig() {
  console.log('\n🔐 测试JWT配置...');
  
  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      console.log('❌ JWT_SECRET 未设置');
      return false;
    }
    
    if (secret.length < 32) {
      console.log('⚠️  JWT_SECRET 长度建议至少32个字符');
    }
    
    // 测试JWT签名和验证
    const payload = { test: 'data' };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);
    
    if (decoded.test === 'data') {
      console.log('✅ JWT签名和验证测试通过');
      return true;
    } else {
      console.log('❌ JWT验证失败');
      return false;
    }
  } catch (error) {
    console.log('❌ JWT配置测试失败:', error.message);
    return false;
  }
}

// 测试文件上传配置
function testFileUploadConfig() {
  console.log('\n📁 测试文件上传配置...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
    
    // 检查上传目录
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ 创建上传目录:', uploadDir);
    } else {
      console.log('✅ 上传目录已存在:', uploadDir);
    }
    
    // 检查文件大小配置
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760;
    console.log('✅ 最大文件大小:', maxFileSize / 1024 / 1024, 'MB');
    
    // 检查文件类型配置
    const allowedTypes = process.env.ALLOWED_FILE_TYPES ? 
      process.env.ALLOWED_FILE_TYPES.split(',') : 
      ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov'];
    console.log('✅ 支持的文件类型:', allowedTypes.join(', '));
    
    return true;
  } catch (error) {
    console.log('❌ 文件上传配置测试失败:', error.message);
    return false;
  }
}

// 测试CORS配置
function testCORSConfig() {
  console.log('\n🌐 测试CORS配置...');
  
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log('✅ 前端地址:', frontendUrl);
    
    const corsCredentials = process.env.CORS_CREDENTIALS === 'true';
    console.log('✅ CORS凭证:', corsCredentials ? '启用' : '禁用');
    
    return true;
  } catch (error) {
    console.log('❌ CORS配置测试失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  const results = [];
  
  results.push(await testDatabaseConnection());
  results.push(testJWTConfig());
  results.push(testFileUploadConfig());
  results.push(testCORSConfig());
  
  console.log('\n=====================================');
  console.log('📋 测试结果汇总:');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`✅ 通过: ${passed}/${total}`);
  console.log(`❌ 失败: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 所有测试通过！配置正确。');
    console.log('🚀 可以启动服务器了！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置。');
    console.log('📖 查看 CONFIG_GUIDE.md 获取详细配置说明。');
  }
}

// 运行测试
runTests().catch(console.error); 