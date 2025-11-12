#!/usr/bin/env node
/** Init as early as possible this file config the env */
import logger from './Tools/logconfig.js';
import {render} from 'ink';
import React from 'react';
import boxen from 'boxen';
import {readTxtFile} from './Tools/fileio.js';
import path from 'path';
import chalk from 'chalk';
import {
	checkApiKey,
	configureEnv,
	configureChatConfig,
	configureAll,
} from './Tools/initConfig.js';
import Args from './Tools/init.js';

// 检查是否需要重新配置
const shouldReconfigure = Args.flags.config;

// 检查API密钥是否存在
if (!checkApiKey()) {
	await configureEnv();
	await configureChatConfig();

	console.log('初始化配置已完成，程序将退出。请重新启动程序以使用新配置。');
	process.exit(0);
} else if (shouldReconfigure) {
	await configureAll();

	console.log('配置已完成，程序将退出。请重新启动程序以使用新配置。');
	process.exit(0);
}

const logo = readTxtFile(path.join(process.env.ROOT_PATH, 'logo.txt'));
console.log(boxen(chalk.blue(logo), {padding: 1, borderStyle: 'none'}));
import SearchQuery from './components/maincomponent.js';

// console.log("\n\n欢迎使用!\n\n");

logger.info('chat-bot-cli 启动');
render(<SearchQuery />);
