// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

// 导入数据库连接
const db = require('./db');

// 中间件
app.use(cors());
app.use(express.json());

// 基本测试路由
app.get('/', (req, res) => {
  res.send('Smart Pillbox Backend is running.');
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
