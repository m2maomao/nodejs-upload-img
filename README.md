# 电子签名文件上传服务

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.8.0-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

专业的电子签名文件上传服务，基于Node.js构建，提供安全可靠的文件存储和管理功能。

## 目录
- [电子签名文件上传服务](#电子签名文件上传服务)
  - [目录](#目录)
  - [功能特性](#功能特性)
  - [快速开始](#快速开始)
    - [环境要求](#环境要求)
    - [安装](#安装)
    - [配置](#配置)
    - [运行](#运行)
  - [API文档](#api文档)
    - [文件上传](#文件上传)
  - [前端集成](#前端集成)
  - [安全注意事项](#安全注意事项)
  - [项目结构](#项目结构)
  - [贡献指南](#贡献指南)
  - [许可证](#许可证)

## 功能特性
- 支持PNG/JPEG/GIF格式文件上传
- 自动生成唯一文件名防止冲突
- 文件类型白名单验证
- 自动清理7天前旧文件
- 完善的错误处理机制
- CORS跨域支持

## 快速开始
### 环境要求
- Node.js 16.8.0+
- npm 7.21.0+
- 推荐使用 [nvm](https://github.com/nvm-sh/nvm) 管理Node版本

### 安装
```bash
git clone https://github.com/m2maomao/nodejs-upload-img.git
cd nodejs-upload-img
npm install
```

### 配置
复制环境示例文件并修改：
```bash
cp .env.example .env
```
环境变量说明：
```ini
PORT=3000
CORS_ORIGIN=*
FILE_STORAGE=uploads/
MAX_FILE_SIZE=10MB
```

### 运行
```bash
npm run dev
```
服务启动后访问：http://localhost:3000

## API文档
### 文件上传
**Endpoint**
`POST /upload`

**请求格式**
`multipart/form-data`

**参数**
| 字段 | 类型   | 说明         |
|------|--------|--------------|
| file | binary | 要上传的文件 |

**成功响应**
```json
{
  "success": true,
  "url": "http://localhost:3000/files/6b9a81ff-65ef-4c32-9203-34adcde6d8da.png",
  "meta": {
    "originalName": "signature.png",
    "size": 24576,
    "mimeType": "image/png"
  }
}
```

## 前端集成
```javascript
// 转换Canvas数据为Blob
const dataURL = signaturePad.toDataURL('image/png');
const blob = dataURLtoBlob(dataURL);

// 创建FormData
const formData = new FormData();
formData.append('file', blob, 'signature.png');

// 调用上传接口
try {
  const response = await fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('文件地址:', result.url);
  }
} catch (error) {
  console.error('上传失败:', error);
}
```

## 安全注意事项
1. 生产环境应配置：
   - 限制CORS_ORIGIN为指定域名
   - 启用HTTPS
   - 设置合理的文件大小限制
   - 定期备份上传目录

## 项目结构
```
.
├── server.js         # 服务入口文件
├── uploads/          # 文件存储目录
├── package.json
└── README.md
```

## 贡献指南
欢迎提交Pull Request，请遵循以下规范：
1. 新功能请添加对应测试用例
2. 保持代码风格一致
3. 更新相关文档

## 许可证
[MIT](LICENSE) © 2024 m2maomao