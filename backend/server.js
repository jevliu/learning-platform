require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// 环境变量配置
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB
const ALLOWED_FILE_TYPES = process.env.ALLOWED_FILE_TYPES ? 
  process.env.ALLOWED_FILE_TYPES.split(',') : 
  ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov'];
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const VERBOSE_LOGGING = process.env.VERBOSE_LOGGING === 'true';

// 日志函数
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (level === 'error') {
    console.error(logMessage, data || '');
  } else if (level === 'warn') {
    console.warn(logMessage, data || '');
  } else if (level === 'info' || VERBOSE_LOGGING) {
    console.log(logMessage, data || '');
  }
};

// 启动日志
log('info', `启动服务器 - 环境: ${NODE_ENV}, 端口: ${PORT}`);

// 中间件配置
app.use(cors({
  origin: FRONTEND_URL,
  credentials: process.env.CORS_CREDENTIALS === 'true'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 创建上传目录
const uploadsDir = path.join(__dirname, UPLOAD_DIR);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  log('info', `创建上传目录: ${uploadsDir}`);
}

// 静态文件服务
app.use(`/${UPLOAD_DIR}`, express.static(uploadsDir));

// 文件类型验证
const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  if (ALLOWED_FILE_TYPES.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${fileExtension}`), false);
  }
};

// Multer配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(safeName));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

// MySQL连接池配置
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0
});

// JWT认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '访问令牌无效' });
    }
    req.user = user;
    next();
  });
};

// 教师权限校验中间件
const authorizeTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: '需要教师权限' });
  }
  next();
};

// 认证路由
app.post('/api/auth/register-teacher', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    const connection = await pool.getConnection();
    
    // 检查邮箱是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // 创建教师用户
    const [result] = await connection.execute(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'teacher']
    );

    connection.release();

    res.status(201).json({ 
      message: '教师账号注册成功',
      userId: result.insertId 
    });
  } catch (error) {
    log('error', '注册错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 学生注册接口
app.post('/api/auth/register-student', async (req, res) => {
  try {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({ error: '姓名和密码不能为空' });
    }
    if (name.toLowerCase() === 'admin') {
      return res.status(403).json({ error: '禁止注册管理员账号' });
    }
    const connection = await pool.getConnection();
    // 检查姓名是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [name]
    );
    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: '该姓名已被注册' });
    }
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    // 创建学生用户（用name作为email字段存储）
    const [result] = await connection.execute(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [name, hashedPassword, 'student']
    );
    connection.release();
    res.status(201).json({ 
      message: '学生账号注册成功',
      userId: result.insertId 
    });
  } catch (error) {
    log('error', '学生注册错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 登录接口支持邮箱或姓名
// ... existing code ...
// 登录接口：只用姓名+密码校验
app.post('/api/auth/login', async (req, res) => {
    try {
      const { name, password } = req.body;
      if (!name || !password) {
        return res.status(400).json({ error: '姓名和密码不能为空' });
      }
      const connection = await pool.getConnection();
      // 查找用户（姓名唯一）
      const [users] = await connection.execute(
        'SELECT id, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
        [name]
      );
      connection.release();
      if (users.length === 0) {
        return res.status(401).json({ error: '账号或密码错误' });
      }
      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: '账号或密码错误' });
      }
      const token = jwt.sign(
        { userId: user.id, name: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.json({
        token,
        user: {
          id: user.id,
          name: user.email,
          role: user.role
        }
      });
    } catch (error) {
      log('error', '登录错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }
  });

// 班级路由
app.get('/api/classes', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [classes] = await connection.execute(
      'SELECT * FROM classes ORDER BY created_at DESC'
    );
    connection.release();
    res.json(classes);
  } catch (error) {
    log('error', '获取班级错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.post('/api/classes', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: '班级名称不能为空' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO classes (name, description, teacher_id) VALUES (?, ?, ?)',
      [name, description, req.user.userId]
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      name,
      description,
      teacher_id: req.user.userId
    });
  } catch (error) {
    log('error', '创建班级错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.delete('/api/classes/:id', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const classId = req.params.id;
    const connection = await pool.getConnection();
    
    // 删除班级（级联删除相关数据）
    await connection.execute('DELETE FROM classes WHERE id = ?', [classId]);
    connection.release();

    res.json({ message: '班级删除成功' });
  } catch (error) {
    log('error', '删除班级错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 资料路由
app.get('/api/classes/:classId/materials', authenticateToken, async (req, res) => {
  try {
    const classId = req.params.classId;
    const connection = await pool.getConnection();
    const [materials] = await connection.execute(
      'SELECT * FROM materials WHERE class_id = ? ORDER BY created_at DESC',
      [classId]
    );
    connection.release();
    res.json(materials);
  } catch (error) {
    log('error', '获取资料错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.post('/api/classes/:classId/materials', authenticateToken, authorizeTeacher, upload.single('file'), async (req, res) => {
  try {
    const classId = req.params.classId;
    const { title, description } = req.body;
    const file = req.file;

    if (!title || !file) {
      return res.status(400).json({ error: '标题和文件不能为空' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO materials (class_id, title, description, file_path, original_filename) VALUES (?, ?, ?, ?, ?)',
      [classId, title, description, file.filename, file.originalname]
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      class_id: classId,
      title,
      description,
      file_path: file.filename,
      original_filename: file.originalname
    });
  } catch (error) {
    log('error', '上传资料错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.delete('/api/classes/:classId/materials/:materialId', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const { materialId } = req.params;
    const connection = await pool.getConnection();
    
    // 获取文件路径
    const [materials] = await connection.execute(
      'SELECT file_path FROM materials WHERE id = ?',
      [materialId]
    );

    if (materials.length === 0) {
      connection.release();
      return res.status(404).json({ error: '资料不存在' });
    }

    const filePath = path.join(uploadsDir, materials[0].file_path);
    
    // 删除数据库记录
    await connection.execute('DELETE FROM materials WHERE id = ?', [materialId]);
    connection.release();

    // 删除物理文件
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: '资料删除成功' });
  } catch (error) {
    log('error', '删除资料错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 视频路由
app.get('/api/classes/:classId/videos', authenticateToken, async (req, res) => {
  try {
    const classId = req.params.classId;
    const connection = await pool.getConnection();
    const [videos] = await connection.execute(
      'SELECT * FROM videos WHERE class_id = ? ORDER BY created_at DESC',
      [classId]
    );
    connection.release();
    res.json(videos);
  } catch (error) {
    log('error', '获取视频错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.post('/api/classes/:classId/videos', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const classId = req.params.classId;
    const { title, description, video_url } = req.body;

    if (!title || !video_url) {
      return res.status(400).json({ error: '标题和视频链接不能为空' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO videos (class_id, title, description, video_url) VALUES (?, ?, ?, ?)',
      [classId, title, description, video_url]
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      class_id: classId,
      title,
      description,
      video_url
    });
  } catch (error) {
    log('error', '添加视频错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.delete('/api/classes/:classId/videos/:videoId', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const { videoId } = req.params;
    const connection = await pool.getConnection();
    
    await connection.execute('DELETE FROM videos WHERE id = ?', [videoId]);
    connection.release();

    res.json({ message: '视频删除成功' });
  } catch (error) {
    log('error', '删除视频错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 笔记路由
app.get('/api/classes/:classId/notes', authenticateToken, async (req, res) => {
  try {
    const classId = req.params.classId;
    const connection = await pool.getConnection();
    const [notes] = await connection.execute(
      'SELECT * FROM notes WHERE class_id = ? ORDER BY created_at DESC',
      [classId]
    );
    connection.release();
    res.json(notes);
  } catch (error) {
    log('error', '获取笔记错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.post('/api/classes/:classId/notes', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const classId = req.params.classId;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO notes (class_id, title, content) VALUES (?, ?, ?)',
      [classId, title, content]
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      class_id: classId,
      title,
      content
    });
  } catch (error) {
    log('error', '添加笔记错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.delete('/api/classes/:classId/notes/:noteId', authenticateToken, authorizeTeacher, async (req, res) => {
  try {
    const { noteId } = req.params;
    const connection = await pool.getConnection();
    
    await connection.execute('DELETE FROM notes WHERE id = ?', [noteId]);
    connection.release();

    res.json({ message: '笔记删除成功' });
  } catch (error) {
    log('error', '删除笔记错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  log('info', `服务器运行在 http://localhost:${PORT}`);
  log('info', `环境: ${NODE_ENV}`);
  log('info', `前端地址: ${FRONTEND_URL}`);
  log('info', `上传目录: ${UPLOAD_DIR}`);
  log('info', `最大文件大小: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  log('info', `允许的文件类型: ${ALLOWED_FILE_TYPES.join(', ')}`);
});