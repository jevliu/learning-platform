# 环境变量配置指南

## 快速配置

1. 复制环境变量示例文件：
```bash
cp env.example .env
```

2. 编辑 `.env` 文件，修改必要的配置：
```bash
# 修改数据库密码
DB_PASSWORD=your_actual_password

# 生成安全的JWT密钥
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
```

3. 验证配置：
```bash
npm run validate
```

## 配置项详解

### 🔐 必需配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DB_HOST` | 数据库主机地址 | `localhost` |
| `DB_USER` | 数据库用户名 | `root` |
| `DB_PASSWORD` | 数据库密码 | `your_password` |
| `DB_NAME` | 数据库名称 | `learning_platform_demo` |
| `JWT_SECRET` | JWT签名密钥 | `your_secret_key` |

### ⚙️ 可选配置

#### 数据库配置
| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `DB_PORT` | `3306` | 数据库端口 |
| `DB_CONNECTION_LIMIT` | `10` | 连接池大小 |
| `DB_QUEUE_LIMIT` | `0` | 连接队列限制 |

#### 服务器配置
| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `3001` | 服务器端口 |
| `NODE_ENV` | `development` | 运行环境 |
| `FRONTEND_URL` | `http://localhost:3000` | 前端地址 |

#### 安全配置
| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `BCRYPT_ROUNDS` | `10` | 密码加密轮数 |
| `JWT_EXPIRES_IN` | `24h` | JWT过期时间 |
| `SESSION_TIMEOUT` | `86400000` | 会话超时时间 |

#### 文件上传配置
| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `UPLOAD_DIR` | `uploads` | 上传目录 |
| `MAX_FILE_SIZE` | `10485760` | 最大文件大小(10MB) |
| `ALLOWED_FILE_TYPES` | 见下方 | 允许的文件类型 |

#### CORS配置
| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `CORS_CREDENTIALS` | `true` | 是否允许凭证 |

#### 日志配置
| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `LOG_LEVEL` | `info` | 日志级别 |
| `VERBOSE_LOGGING` | `true` | 详细日志 |

## 文件类型配置

默认支持的文件类型：
```
pdf,doc,docx,ppt,pptx,xls,xlsx,txt,jpg,jpeg,png,gif,mp4,avi,mov
```

自定义文件类型示例：
```env
ALLOWED_FILE_TYPES=pdf,doc,docx,zip,rar,txt
```

## 环境配置示例

### 开发环境
```env
NODE_ENV=development
LOG_LEVEL=debug
VERBOSE_LOGGING=true
DEBUG_MODE=true
```

### 生产环境
```env
NODE_ENV=production
LOG_LEVEL=warn
VERBOSE_LOGGING=false
DEBUG_MODE=false
```

## 安全建议

### 1. JWT密钥
- 长度至少32个字符
- 包含大小写字母、数字和特殊字符
- 定期更换

生成示例：
```bash
# 使用Node.js生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. 数据库密码
- 使用强密码
- 避免使用默认密码
- 定期更换

### 3. 生产环境配置
```env
# 生产环境推荐配置
NODE_ENV=production
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
DB_PASSWORD=your_strong_database_password
LOG_LEVEL=warn
VERBOSE_LOGGING=false
MAX_FILE_SIZE=52428800  # 50MB
```

## 配置验证

运行配置验证脚本：
```bash
npm run validate
```

验证内容包括：
- ✅ 必需环境变量检查
- ✅ 可选环境变量检查
- ✅ 端口号验证
- ✅ 文件大小验证
- ✅ JWT密钥长度验证
- ✅ 数据库连接配置验证
- ✅ 文件类型配置验证

## 常见问题

### Q: 配置验证失败怎么办？
A: 检查错误信息，确保所有必需的环境变量都已设置，并且值在有效范围内。

### Q: 如何修改文件上传大小限制？
A: 修改 `MAX_FILE_SIZE` 环境变量，单位为字节。例如：`52428800` = 50MB。

### Q: 如何添加新的文件类型支持？
A: 在 `ALLOWED_FILE_TYPES` 中添加新的文件扩展名，用逗号分隔。

### Q: 生产环境需要修改哪些配置？
A: 主要修改：
- `NODE_ENV=production`
- 使用更强的 `JWT_SECRET`
- 调整 `LOG_LEVEL` 和 `VERBOSE_LOGGING`
- 确保数据库密码安全

## 配置最佳实践

1. **环境分离**：开发、测试、生产环境使用不同的配置
2. **敏感信息**：不要在代码中硬编码敏感信息
3. **版本控制**：不要将 `.env` 文件提交到版本控制
4. **备份配置**：定期备份生产环境配置
5. **监控配置**：定期检查配置的有效性 