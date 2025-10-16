const path = require('path');

// 获取当前工作目录
const cwd = process.cwd();
console.log('Current working directory:', cwd);

// 解析 .env 文件的绝对路径
const envPath = path.resolve(cwd, '.env');
console.log('Expected .env path:', envPath);

// 检查文件是否存在
const fs = require('fs');
fs.access(envPath, fs.constants.F_OK, (err) => {
  if (err) {
    console.log('.env file does not exist at:', envPath);
  } else {
    console.log('.env file exists at:', envPath);
    
    // 尝试加载 .env 文件
    const dotenv = require('dotenv');
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      console.error('Error loading .env file:', result.error);
    } else {
      console.log('ROOT_PATH from .env:', process.env.ROOT_PATH);
    }
  }
});