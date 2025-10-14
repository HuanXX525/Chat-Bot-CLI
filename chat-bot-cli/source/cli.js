/** Init as early as possible this file config the env */
import logger from './Tools/logconfig.js';
import {render} from 'ink';
import SearchQuery from './components/maincomponent.js';
import React from 'react';
import boxen from 'boxen';
import { readTxtFile } from './Tools/fileio.js';
import path from 'path';
import chalk from 'chalk';
const logo = readTxtFile(path.join(process.env.ROOT_PATH, 'logo.txt'));

console.log(boxen(chalk.blue(logo), { padding: 1 ,borderStyle: "none"}));
// console.log("\n\n欢迎使用!\n\n");

logger.info('chat-bot-cli 启动');
render(<SearchQuery />);
