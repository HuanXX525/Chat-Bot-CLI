import {execSync} from 'child_process';
import logger from '../../Tools/logconfig.js';
import { parseJSON } from '../executetoolbot.js';
import executeToolBot from '../executetoolbot.js';

/**
 * 使用系统默认浏览器打开指定URL
 * @param {string} url - 要打开的网页地址（需包含http/https协议）
 * @returns {Promise} - 成功时resolve，失败时reject
 */
function _openUrlInDefaultBrowser(url) {
    logger.info(`打开网页：${url}`);
    const result = {
        result: false,
        data : [],
        message: '',
    };
    
    // 验证URL格式
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        result.message = 'URL必须以http://或https://开头';
        logger.warn("Url不合法");
        result = false;
        return result;
    }
    const command = `start ${url}`;

	try {
		execSync(command);
        logger.info('应用程序启动成功');
        result.result = true;
        result.message = `网页${url}打开成功`;
        logger.info('网页打开成功');
        result.data.push({arg: 'url', value: url});
		// return true;
	} catch (error) {
        result.message = '不知道为什么没法打开网页';
        logger.error('不知道为什么没法打开网页');
        result = false;
	}
    return result;
}

const description = {
	task: '返回一个符合用户要求的网址，如果有多个，优先选择官网主页',
	toolDescription: {
		name: 'openUrlInDefaultBrowser',
		description: '使用默认浏览器打开你给的网址',
		toolArgs: {
			url: {
				type: 'string',
				description: '联网搜索或根据你知道的给出符合用户要求的网址',
				required: true
			},
		},
	},
	information: " "
};



/**
 * 使用系统默认浏览器打开指定URL
 * @param {string} userDemand - 用户的需求
 * @returns {Promise} - 成功时resolve，失败时reject
 * @example
 * const result = await openUrlInDefaultBrowser('https://www.google.com');
 * console.log(result);
 * // {
 * //     result: true,
 * //     data: [{arg: "url", value: "https://www.google.com"}],
 * //     message: "网页https://www.google.com打开成功"
 * // }
 */
async function openUrlInDefaultBrowser(userDemand) {
    executeToolBot.addToolDescription(JSON.stringify(description));

    let url = undefined;
    let result = undefined;
    // let message = undefined;
    logger.info("ENTER FUNCTION openUrlInDefaultBrowser BEFOR  LOOP");
    for (
        let i = 0;
        i < Number(process.env.TOOL_MAX_RETRY_TIMES) && !url;
        i++
    ) {
        try {
            const response = await executeToolBot.sendMessage(userDemand);
            logger.info(`返回函数参数${response}`);
            
            url = JSON.parse(parseJSON(response))?.url;
            logger.info(`准备打开网页：${url}`);
            
            if (!url) {
                userDemand = '没有在你的回复中解析到网址，请重新回答';
                logger.warn(`没有在你的回复中解析到网址，请重新回答，准备重试第${i + 1}次`);
            } else {
                result = _openUrlInDefaultBrowser(url);
                if (result.result) {   
                    break;
                }
            }
        } catch (error) {
            logger.error(
							`执行openUrlInDefaultBrowser失败`,
							error.code + error.stack,
						);
            result = {
                result: false,
                data : [],
                message: '程序员写的程序出错了，导致你没法打开网页',
            }
        }
    }

    executeToolBot.clearChatHistorySaveSystem();

    return result;
}

export default openUrlInDefaultBrowser;
