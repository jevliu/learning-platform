# 快速启动指南

## 前置要求

1. **Node.js** (版本 14 或更高)
2. **MySQL** (版本 5.7 或更高)
3. **npm** 或 **yarn**

## 5分钟快速启动

### 1. 数据库设置 (2分钟)

```bash
# 登录MySQL
mysql -u root -p

# 在MySQL中执行
source database.sql;
exit;
```

### 2. 环境配置 (1分钟)

```bash
cd backend
cp env.example .env
# 编辑 .env 文件，修改数据库密码
```

### 3. 启动服务 (2分钟)

#### Windows用户：
```bash
# 双击运行 start.bat
# 或者在命令行中：
start.bat
```

#### Linux/Mac用户：
```bash
# 给脚本执行权限
chmod +x start.sh

# 运行启动脚本
./start.sh
```

#### 手动启动：
```bash
# 终端1 - 启动后端
cd backend
npm install
npm start

# 终端2 - 启动前端
cd frontend
npm install
npm start
```

### 4. 访问应用

1. 打开浏览器访问：`http://localhost:3000`
2. 点击"首次使用？注册教师账号"
3. 输入邮箱和密码注册
4. 使用注册的账号登录

## 功能测试

### 教师功能测试：
1. 登录后创建新班级
2. 上传学习资料文件
3. 添加视频链接
4. 创建学习笔记

### 学生功能测试：
1. 查看班级列表
2. 下载学习资料
3. 访问视频链接
4. 查看学习笔记

## 常见问题

### Q: 数据库连接失败？
A: 检查MySQL服务是否运行，确认.env文件中的数据库配置正确

### Q: 端口被占用？
A: 修改.env文件中的PORT配置，或停止占用端口的其他服务

### Q: 前端无法连接后端？
A: 确认后端服务正在运行，检查控制台是否有错误信息

### Q: 文件上传失败？
A: 检查backend/uploads目录权限，确保磁盘空间充足

## 技术栈

- **前端**: React + Tailwind CSS
- **后端**: Node.js + Express
- **数据库**: MySQL
- **认证**: JWT
- **文件上传**: Multer

## 项目结构

```
learning-platform-demo/
├── backend/          # Express后端
├── frontend/         # React前端
├── database.sql      # 数据库建表
├── start.bat         # Windows启动脚本
├── start.sh          # Linux/Mac启动脚本
└── README.md         # 详细文档
```

## 下一步

- 查看 `README.md` 获取详细文档
- 探索API接口文档
- 自定义功能和样式
- 部署到生产环境 