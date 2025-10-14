import {getFilesWithDepth, removeParentDir} from '../..//Tools/fileio.js';
import {execSync} from 'child_process';
import logger from '../../Tools/logconfig.js';
import { parseJSON } from '../executetoolbot.js';
/**
 * 获取从开始菜单中的应用程序列表
 * @returns {Object} - 返回一个对象，包含开始菜单的路径和应用程序的列表
 * @example
 * const result = getApplicationListByStartMenu();
 * console.log(result);
 * // {
 * //     startMenuPath: 'C:/ProgramData/Microsoft/Windows/Start Menu/Programs',
 * //     applicationFastList: ['app1.exe', 'app2.exe', ...]
 * // }
 */

function getApplicationListByStartMenu() {
	const startMenuPath = 'C:/ProgramData/Microsoft/Windows/Start Menu/Programs';
	const applicationFastList = getFilesWithDepth(startMenuPath, {
		autoDepth: true,
	});
	return {
		startMenuPath,
		applicationFastList,
	};
}

/**
 * 启动应用程序
 * @param {string} path - 应用程序的路径
 * @example
 * launchApplication('C:/Program Files/Google/Chrome/Application/chrome.exe');
 */
function _launchApplication(path) {
	logger.info(`启动应用程序:${path}`);
	try {
		execSync(`start "" "${path}"`);
        logger.info('应用程序启动成功');
        return true
	} catch (error) {
        logger.error(path + '应用程序启动失败', error);
        return false
	}
}

import executeToolBot from '../executetoolbot.js';
import { log } from 'console';

/** 程序列表 */
const applicationList = getApplicationListByStartMenu();
const relativePathList = applicationList.applicationFastList.map(file =>
	removeParentDir(file, applicationList.startMenuPath),
);
const nameToPath = new Map(
	relativePathList.map((name, index) => [
		name,
		applicationList.applicationFastList[index],
	]),
);
// console.log(relativePathList);
// console.log(nameToPath);

const description = {
	task: '从information中给的列表中选择一个符合用户要求的应用程序，如果有多个，优先选择系统相关的而不是第三方软件的',
	toolDescription: {
		name: 'launchapplication',
		description: '执行你所选择的应用程序',
		toolArgs: {
			path: {
				type: 'string',
				description:
					'从information中给的列表中选择的路径，如果没有符合要求的软件填空字符串，别没找到却打开了其他软件',
				required: true, // 标识该参数为必填项
			},
		},
	},
	information: relativePathList.join('\n'),
};


/**
 * 启动用户所选择的应用程序
 * @param {string} userDemand - 用户的需求
 * @returns {Promise<{result: boolean, data: Array<{arg: string, value: string}>, message: string}>} - 启动结果
 * @example
 * const result = await launchApplicationFunction('Chrome');
 * console.log(result);
 * // {
 * //     result: true,
 * //     data: [{arg: "path", value: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"}],
 * //     message: "应用程序启动成功"
 * // }
 */
async function launchApplication(userDemand) {
	executeToolBot.addToolDescription(JSON.stringify(description));

    let path = undefined;
    let result = undefined;
    let message = "";


	for (let i = 0; i < Number(process.env.TOOL_MAX_RETRY_TIMES) && !path; i++) {
		try {
			const response = await executeToolBot.sendMessage(userDemand);
			logger.info(`返回函数参数${response}`);

			const applicationName = JSON.parse(parseJSON(response))?.path;
			if (applicationName === '') {
				result = false;
				message = "没有找到软件，可能是没通过正常途径安装，不是小助手的错误";
				break;
			}
			logger.info(`准备启动应用程序：${applicationName}`);
			path = nameToPath.get(applicationName);
			logger.info(`获取到应用程序路径：${path}`);
			if (!path) {
				userDemand = '没有在列表中找到你所选择的应用程序，请重新回答';
				logger.warn(`没有在列表中找到所选择的应用程序，准备重试第${i + 1}次`);
			} else {
				result = _launchApplication(path);
                break;
			}
		} catch (error) {
			logger.error('错误:', error);
            result = false;
		}
    }

    executeToolBot.clearChatHistorySaveSystem();

    return {
        result: result,
        data: [{arg: "path", value: path}],
        message: (result ? '应用程序启动成功 ' : '应用程序启动失败 ') + message,
    };
}



/** 仅有写在JSON文件中的函数才可以被调用到exe注册 */
export default launchApplication;
// 