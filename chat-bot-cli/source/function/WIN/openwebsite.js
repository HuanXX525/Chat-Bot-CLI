import logger from '../../Tools/logconfig.js';
import { configJSON } from '../../Tools/init.js';
import * as cheerio from 'cheerio';
import {execSync} from 'child_process';
import { parseJSON } from '../executetoolbot.js';
import executeToolBot from '../executetoolbot.js';
import fs from 'fs';
import { json } from 'stream/consumers';
import { log } from 'console';
function readFavourite(htmlPath) {
	// 读取 HTML 文件内容
	const htmlContent = fs.readFileSync(htmlPath, 'utf8'); // 替换为你的 HTML 文件路径
	const $ = cheerio.load(htmlContent);
	// console.log($);
	// 提取所有 <a> 标签的 href 和文本
	const aTagsInfo = new Map(); // 修正为 Map（支持 set 方法）

	$('A').each((index, element) => {
		const href = $(element).attr('href') || ''; // 获取 href 属性
		const name = $(element).text().trim() || ''; // 获取文本内容（去空格）
		aTagsInfo.set(href, name);
	});

	return aTagsInfo;
}

// console.log(configJSON?.BrowserFavouritePath);
// console.log(readFavourite(configJSON?.BrowserFavouritePath[0]));
/**
 * 使用系统默认浏览器打开指定URL
 * @param {string} url - 要打开的网页地址（需包含http/https协议）
 * @returns {Promise} - 成功时resolve，失败时reject
 */

const information = new Map();
for (let i = 0; i < configJSON?.BrowserFavouritePath.length; i++) {
	const res = readFavourite(configJSON?.BrowserFavouritePath[i]);
	for (const [key, value] of res) {
		information.set(key, value);
	}
}
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
        // logger.info('应用程序启动成功');
        result.result = true;
        result.message = `网页${url}打开成功`;
        logger.info('网页打开成功');
        result.data.push({ arg: 'url', value: url });
        if (information.has(url)) {
            result.data.push({ arg: 'name', value: information.get(url) });
        }
		// return true;
	} catch (error) {
        result.message = '不知道为什么没法打开网页';
        logger.error('不知道为什么没法打开网页');
        result = false;
	}
    return result;
}



const informationStr = Array.from(information.entries()).map(([key, value]) => `URL[${key}] NAME[${value}]`).join('\n');

const description = {
	task: '返回一个符合用户要求的网址，information中有用户的收藏夹网址，不要一昧的选择收藏夹中的网站，必须较为严格匹配收藏夹的NAME才能选择，否则必须你来生成一个符合要求的网址',
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
	information: informationStr,
};
// console.log(JSON.stringify(description));



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
    logger.info(`User demand: ${userDemand}`);
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
