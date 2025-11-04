import winston from "winston"
import {format} from 'date-fns';
import path from "path";
import dotenv from 'dotenv';
dotenv.config({path: ["D:/Desktop/FILE/ChatBot/chat-bot-cli/.env"]});
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
		return path.join(process.env.ROOT_PATH ,dirPath, fileName);
	}

	return "❌获取日志路径失败，大概率在Log文件夹下";
}

export default logger;
export {getLogFilePath};
