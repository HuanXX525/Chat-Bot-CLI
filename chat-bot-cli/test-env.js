const dotenv = require('dotenv');
const path = require('path');

// 指定 .env 文件的路径
const envPath = path.resolve(__dirname, '.env');

// 加载 .env 文件
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('ROOT_PATH from .env:', process.env.ROOT_PATH);
}