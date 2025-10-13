import logger from './logconfig.js';
import fs from 'fs';
import path from 'path';

const readJsonFile = filePath => {
	try {
		const jsonString = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(jsonString);
	} catch (err) {
		logger.error('同步读取失败:', err);
		return undefined;
	}
};

const readTxtFile = filePath => {
	try {
		return fs.readFileSync(filePath, 'utf8');
	} catch (err) {
		logger.error('同步读取失败:', err);
		return undefined;
	}
};

const getDirectSubDirNames = dirPath => {
	// 同步读取目录并获取文件类型信息
	const dirents = fs.readdirSync(dirPath, {withFileTypes: true});

	// 过滤出目录，只返回名称（dirent.name）
	return dirents
		.filter(dirent => dirent.isDirectory()) // 保留目录类型
		.map(dirent => dirent.name); // 仅提取文件夹名称
};

function getDirectSubDirFiles(expressionPath) {
	return fs
		.readdirSync(expressionPath)
		.filter(file => fs.statSync(path.join(expressionPath, file)).isFile());
}


export {readJsonFile, readTxtFile, getDirectSubDirNames, getDirectSubDirFiles};
