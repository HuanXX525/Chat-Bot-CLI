import logger from './logconfig.js';
import fs from 'fs';
import { get } from 'http';
import path from 'path';

const TESTPATH = 'D:/Desktop/FILE/ChatBot/chat-bot-cli/source';

const readJsonFile = filePath => {
	try {
		const jsonString = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(jsonString);
	} catch (error) {
		logger.error('同步读取失败:', error.code + error.stack);
		return undefined;
	}
};

const readTxtFile = filePath => {
	try {
		return fs.readFileSync(filePath, 'utf8');
	} catch (error) {
		logger.error('同步读取失败:', error.code + error.stack);
		return undefined;
	}
};

/**
 * 获取指定目录下的直接子目录
 * @param {string} dirPath - 目录路径
 * @param {boolean} [needPath=false] - 是否需要完整路径（默认 false）
 * @returns {string[]} - 直接子目录列表
 * @example
 * const dirPath = 'C:/Users/xxx/Documents';
 * const result = getDirectSubDirNames(dirPath);
 * console.log(result); // ['dir1', 'dir2']
 */
const getDirectSubDirNames = (dirPath, needPath = false) => {
  
	// 同步读取目录并获取文件类型信息
	const dirents = fs.readdirSync(dirPath, {withFileTypes: true});
	let result = dirents.filter(dirent => dirent.isDirectory()); // 保留目录类
	return needPath ? result.map(dirent => path.join(dirent.parentPath, dirent.name)) : result.map(dirent => dirent.name);
};
// console.log(getDirectSubDirNames(TESTPATH));
// console.log(getDirectSubDirNames(TESTPATH, true));


/**
 * 获取指定目录下的直接子文件
 * @param {string} expressionPath - 目录路径
 * @param {boolean} [needPath=false] - 是否需要完整路径（默认 false）
 * @returns {string[]} - 直接子文件列表
 * @example
 * const expressionPath = 'C:/Users/xxx/Documents';
 * const result = getDirectSubDirFiles(expressionPath);
 * console.log(result); // ['file1.txt', 'file2.txt']
 */
function getDirectSubDirFiles(
	expressionPath,
	needPath = false,
	allowedExtensions = [],
) {
	const fileNames = fs.readdirSync(expressionPath).filter(file => {
		// 首先检查是否为文件
		const isFile = fs.statSync(path.join(expressionPath, file)).isFile();
		if (!isFile) return false;

		// 如果没有指定允许的后缀，则全部保留
		if (allowedExtensions.length === 0) return true;

		// 检查文件后缀是否在允许的列表中
		const ext = path.extname(file).toLowerCase();
		// 处理不带点的后缀名情况（如"js"而不是".js"）
		const normalizedExt = ext.startsWith('.') ? ext : `.${ext}`;
		return allowedExtensions.some(
			allowed => `.${allowed.toLowerCase()}` === normalizedExt,
		);
	});

	return needPath
		? fileNames.map(file => path.join(expressionPath, file))
		: fileNames;
}
// console.log(getDirectSubDirFiles(TESTPATH));
// console.log(getDirectSubDirFiles(TESTPATH, true));


/**
 * 获取指定目录下的所有文件，包括子目录
 * @param {string} startDir - 起始目录
 * @param {Object} [options={}] - 配置
 * @param {boolean} [options.includeDir=false] - 是否包含目录
 * @param {boolean} [options.autoDepth=false] - 是否自动递归遍历
 * @param {number} [options.maxDepth=1] - 最大递归深度
 * @returns {string[]} - 文件列表
 * @example
 * const result = getFilesWithDepth('C:/Users/xxx/Documents');
 * console.log(result); // ['file1.txt', 'file2.txt', ...]
 */
function getFilesWithDepth(
  startDir,
	options = {},
  extensions = []
) {
  // 默认配置
  const {
    includeDir = false,
    autoDepth = false,
	  maxDepth = 1,
	delParent = false
  } = options;

  let result = [];

  let folders = [startDir];
  for (let i = 0; (autoDepth || i < maxDepth) && folders.length > 0 ; i++) {
		let nextDepthFolder = [];
		for (let folder of folders) {
			nextDepthFolder.push(...getDirectSubDirNames(folder, true));
			result.push(...getDirectSubDirFiles(folder, true, extensions));
			if (includeDir) {
				result.push(...folder);
			}
		}
		folders = [...nextDepthFolder]; // 复制一份新数组
		nextDepthFolder = [];
	}
  return delParent ? result.map(file => removeParentDir(file, startDir)) : result;
}
// console.log(getFilesWithDepth(TESTPATH, 1));
// console.log(getFilesWithDepth(TESTPATH, {autoDepth: true}));
function removeParentDir(fullPath, parentDir) {
	// 标准化路径（处理斜杠、相对路径等，确保格式一致）
	const normalizedFullPath = path.normalize(fullPath);
	const normalizedParentDir = path.normalize(parentDir);

	// 判断 fullPath 是否以 parentDir 为前缀
	if (normalizedFullPath.startsWith(normalizedParentDir)) {
		// 计算父目录路径的长度（加 1 是为了去掉父目录末尾的斜杠）
		const parentLength = normalizedParentDir.length;
		// 截取父目录之后的部分
		const relativePath = normalizedFullPath.slice(parentLength);
		// 去掉可能残留的开头斜杠（可选，根据需求调整）
		return relativePath.startsWith(path.sep)
			? relativePath.slice(1)
			: relativePath;
	}

	// 若 fullPath 不包含 parentDir，则返回原路径
	return fullPath;
}

export { readJsonFile, readTxtFile, getDirectSubDirNames, getDirectSubDirFiles, getFilesWithDepth, removeParentDir};
