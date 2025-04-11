const express = require('express');
const multer = require('multer');
const cors = require('cors');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== 中间件配置 ====================
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); // CORS 配置
app.use(express.json()); // JSON 解析

// ==================== 文件存储配置 ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    // 异步创建上传目录（如果不存在）
    fs.promises.mkdir(uploadDir, { recursive: true }).catch(err => {
      console.error('目录创建失败:', err);
    });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const mimeExtension = mime.extension(file.mimetype); // 核心逻辑
    const safeExtension = mimeExtension ? `.${mimeExtension}` : '.dat';
    const uniqueName = `${uuidv4()}${safeExtension}`;
    cb(null, uniqueName);
  }
});

// 文件类型白名单
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 限制10MB
    files: 1 // 单文件上传
  }
});

// ==================== 路由处理 ====================
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      throw new Error('未收到文件');
    }

    // 构建文件访问URL
    const fileUrl = `${process.env.BASE_URL || req.protocol + '://' + req.get('host')}/files/${req.file.filename}`;

    // 可在此将文件信息存入数据库
    // Example: await FileModel.create({ filename: req.file.filename, url: fileUrl });

    res.status(201).json({
      success: true,
      url: fileUrl,
      meta: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('[上传错误]', error.message);
    res.status(400).json({
      success: false,
      error: error.message || '文件上传失败'
    });
  }
});

// 静态文件访问路由
app.use('/files', express.static(path.join(__dirname, 'uploads')));

// ==================== 错误处理中间件 ====================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer 错误处理
    let message = '';
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = '文件大小超过限制';
        break;
      case 'LIMIT_FILE_COUNT':
        message = '文件数量超过限制';
        break;
      default:
        message = '文件上传错误';
    }
    res.status(413).json({ success: false, error: message });
  } else {
    // 其他错误处理
    res.status(500).json({ success: false, error: '服务器内部错误' });
  }
});

// ==================== 启动服务 ====================
app.listen(PORT, () => {
  console.log(`服务器运行中: http://localhost:${PORT}`);
  console.log(`上传端点: POST http://localhost:${PORT}/upload`);
});

// ==================== 定时清理旧文件（可选） ====================
const cleanupInterval = 24 * 60 * 60 * 1000; // 每天清理一次
setInterval(() => {
  const dir = path.join(__dirname, 'uploads');
  fs.promises.readdir(dir).then(async (files) => {
    await Promise.all(files.map(async (file) => {
      const filePath = path.join(dir, file);
      try {
        const stat = await fs.promises.stat(filePath);
        if (stat.isFile() && Date.now() - stat.mtimeMs > 7 * 24 * 60 * 60 * 1000) {
          await fs.promises.unlink(filePath); // 异步删除旧文件
          console.log(`已清理文件: ${file}`);
        }
      } catch (err) {
        console.error(`文件处理失败: ${file}`, err);
      }
    }));
  }).catch(err => {
    console.error('目录读取失败:', err);
  });
}, cleanupInterval);
