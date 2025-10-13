import winston from "winston"
import {format} from 'date-fns';
import path from "path";
import dotenv from 'dotenv';
import { log } from "console";
/** Init as early as possible */
dotenv.config();

// 获取当前时间并格式化为YYYY-MM-DD格式
const currentDate = format(new Date(), 'yyyy-MM-dd-HH-mm');

// 拼接日志路径与时间（如果logPath存在则使用，否则默认当前目录）
const rootPath = process.env.ROOT_PATH || '.';
const logPath = process.env.LOG_PATH || 'log';

const LOG_PATH = path.join(rootPath, logPath);
// console.log(LOG_PATH);
const fileName = `${currentDate}.log`;
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

export default logger;
export {LOG_PATH};
