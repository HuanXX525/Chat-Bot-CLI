// 从 node:module 中导入 createRequire，用于兼容 CommonJS 模块
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url); // 创建 require 函数

// 使用 require 导入 node-windows（保持兼容性）
const {isAdmin, elevate} = require('node-windows');
import {execPath, argv} from 'process';


elevate(process.execPath, process.argv, err => {
    if (err) throw err;
    console.log('已以管理员身份重启');
});

