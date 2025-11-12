import winston from "winston"
import {format} from 'date-fns';
import path from "path";
import dotenv from 'dotenv';
import fs from 'fs';
import {fileURLToPath} from 'url';

// 当前文件的绝对路径（类似 CommonJS 中的 __filename）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
// 2. 读取现有内容并修改
try {
	const data = fs.readFileSync(envPath, 'utf8');
	const updatedData = data.replace(
		/^ROOT_PATH=.*/gm,
		`ROOT_PATH=${path.join(__dirname, '../../Project')}`,
	);
	fs.writeFileSync(envPath, updatedData, 'utf8');
	console.log('[.env]成功配置项目根目录');
} catch (err) {
	console.error('[.env]：项目根目录配置失败', err);
}


dotenv.config({path: [envPath]});
// dotenv.config({path: ["D:/Desktop/FILE/ChatBot/chat-bot-cli/.env"]});
// import { log } from "console";
// import {readJsonFile} from './fileio.js';

/** Init as early as possible */

// 获取当前时间并格式化为YYYY-MM-DD格式
const currentDate = format(new Date(), 'yyyy-MM-dd-HH-mm');

// 拼接日志路径与时间（如果logPath存在则使用，否则默认当前目录）
const rootPath = process.env.ROOT_PATH || '.';
const logPath = process.env.LOG_PATH || 'log';

const LOG_PATH = path.join(rootPath, logPath);
// console.log(LOG_PATH);
const fileName = `${currentDate}.log`;
const logFilePath = path.join(LOG_PATH, fileName);
// console.log(logFilePath);
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(info => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`),
	),
	transports: [
		// new winston.transports.Console(),
		new winston.transports.File({dirname: LOG_PATH, filename: fileName, maxsize: 1024 * 1024 * 5}),
	],
});
console.log(`日志文件路径：${logFilePath}`)
console.log("使用--help查看帮助信息")
logger.info("env初始化完成");
logger.info("日志初始化完成");

function getLogFilePath() {
	// 获取第一个文件传输的路径信息
	const fileTransport = logger.transports.find(
		t => t instanceof winston.transports.File,
	);

	if (fileTransport) {
		// 获取完整文件路径
		const fileName = fileTransport.filename;
		const dirPath = fileTransport.dirname;
		return path.join(dirPath, fileName);
	}

	return "❌获取日志路径失败，大概率在Log文件夹下";
}

export default logger;
export {getLogFilePath};
