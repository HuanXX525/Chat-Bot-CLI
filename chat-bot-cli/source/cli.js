#!/usr/bin/env node

import React from 'react';
import {render} from 'ink';
import App from './app.js';

// 检查是否支持raw mode
if (!process.stdin.isTTY) {
	console.error('Error: This application requires a TTY terminal that supports raw mode.');
	console.error('Please run this in a terminal that supports raw mode (like Windows Terminal, iTerm2, or most Linux terminals).');
	process.exit(1);
}

// 初始化聊天记录 - 使用 console.log 直接输出，不经过 Ink
console.log('=== 聊天应用已启动 ===');
console.log('欢迎使用终端聊天应用！');
console.log('这里的所有历史消息都使用终端原生滚动');
console.log('新消息会实时显示在下方');
console.log('使用 ESC 退出应用');
console.log('====================');
console.log(''); // 空行分隔

// 启动 Ink 应用（只渲染输入框）
render(<App />);
