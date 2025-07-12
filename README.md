# 在线学习资料共享平台 Demo

这是一个完整的在线学习资料共享平台演示项目，包含React前端和Node.js Express后端，使用MySQL数据库和本地文件存储。

## 项目结构

```
learning-platform-demo/
├── backend/                 # Node.js Express 后端
│   ├── server.js           # 主服务器文件
│   ├── package.json        # 后端依赖
│   ├── env.example         # 环境变量示例
│   └── uploads/            # 文件上传目录（自动创建）
├── frontend/               # React 前端
│   ├── src/
│   │   ├── App.js          # 主应用组件
│   │   ├── LoginScreen.js  # 登录界面
│   │   ├── api.js          # API工具函数
│   │   ├── index.js        # 应用入口
│   │   └── index.css       # 样式文件
│   ├── public/
│   │   └── index.html      # HTML模板
│   ├── package.json        # 前端依赖
│   ├── tailwind.config.js  # Tailwind配置
│   └── postcss.config.js   # PostCSS配置
├── database.sql            # MySQL数据库建表SQL
└── README.md               # 项目说明
```

## 功能特性

### 用户认证
- 教师账号注册和登录
- JWT令牌认证
- 基于角色的权限控制

### 班级管理
- 教师可以创建和管理班级
- 学生可以查看班级列表

### 学习资料管理
- 教师可以上传文件资料
- 学生可以下载资料
- 支持文件描述和标题

### 视频资源管理
- 教师可以添加视频链接
- 学生可以访问视频资源

### 学习笔记管理
- 教师可以创建学习笔记
- 学生可以查看笔记内容

## 技术栈

### 后端
- **Node.js** - 运行环境
- **Express** - Web框架
- **MySQL** - 数据库
- **bcryptjs** - 密码加密
- **jsonwebtoken** - JWT认证
- **multer** - 文件上传
- **cors** - 跨域支持

### 前端
- **React** - 前端框架
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库
- **jwt-decode** - JWT解析

## 安装和运行

### 1. 数据库设置

首先确保您已安装MySQL，然后执行以下步骤：

1. 登录MySQL：
```bash
mysql -u root -p
```

2. 执行数据库建表SQL：
```bash
source database.sql
```

3. 创建环境变量文件：
```bash
cd backend
cp env.example .env
```

4. 编辑 `.env` 文件，配置您的MySQL连接信息：
```env
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=learning_platform_demo

# JWT配置
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# 服务器配置
PORT=3001
NODE_ENV=development
```

5. 验证配置：
```bash
cd backend
npm run validate
```

### 2. 后端启动

```bash
cd backend
npm install
npm start
```

或者使用配置验证后启动：
```bash
cd backend
npm run setup
```

后端服务将在 `http://localhost:3001` 启动。

### 3. 前端启动

```bash
cd frontend
npm install
npm start
```

前端应用将在 `http://localhost:3000` 启动。

## 使用说明

### 首次使用

1. 启动前后端服务后，访问 `http://localhost:3000`
2. 在登录界面点击"首次使用？注册教师账号"
3. 输入邮箱和密码注册教师账号
4. 注册成功后，使用该账号登录

### 教师功能

- 创建和管理班级
- 上传学习资料文件
- 添加视频链接
- 创建学习笔记
- 删除班级和内容

### 学生功能

- 查看班级列表
- 下载学习资料
- 访问视频资源
- 查看学习笔记

## API接口

### 认证接口
- `POST /api/auth/register-teacher` - 注册教师账号
- `POST /api/auth/login` - 用户登录

### 班级接口
- `GET /api/classes` - 获取班级列表
- `POST /api/classes` - 创建班级（教师）
- `DELETE /api/classes/:id` - 删除班级（教师）

### 资料接口
- `GET /api/classes/:classId/materials` - 获取班级资料
- `POST /api/classes/:classId/materials` - 上传资料（教师）
- `DELETE /api/classes/:classId/materials/:materialId` - 删除资料（教师）

### 视频接口
- `GET /api/classes/:classId/videos` - 获取班级视频
- `POST /api/classes/:classId/videos` - 添加视频（教师）
- `DELETE /api/classes/:classId/videos/:videoId` - 删除视频（教师）

### 笔记接口
- `GET /api/classes/:classId/notes` - 获取班级笔记
- `POST /api/classes/:classId/notes` - 添加笔记（教师）
- `DELETE /api/classes/:classId/notes/:noteId` - 删除笔记（教师）

## 注意事项

1. 确保MySQL服务正在运行
2. 检查数据库连接配置是否正确
3. 确保端口3000和3001未被占用
4. 文件上传目录会自动创建在backend/uploads/
5. 所有API请求都需要JWT认证（除了注册和登录）

## 开发模式

后端开发模式（自动重启）：
```bash
cd backend
npm run dev
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL服务是否运行
   - 验证.env文件中的数据库配置

2. **端口被占用**
   - 修改.env文件中的PORT配置
   - 或停止占用端口的其他服务

3. **文件上传失败**
   - 检查uploads目录权限
   - 确保磁盘空间充足

4. **前端无法连接后端**
   - 确认后端服务正在运行
   - 检查CORS配置
   - 验证API_BASE_URL配置

## 许可证

MIT License 