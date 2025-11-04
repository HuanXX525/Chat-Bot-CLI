import {ControlledTextInput} from './input.js';
import termSize from 'term-size';
import {ChatBotAgent, CallToolAgent} from '../Tools/agent.js';
import ChatBubble from './chatbubble.js';
import {consoleError, consoleChat, consoleAction} from './chatbubble.js';
import Args from '../Tools/init.js';
import React, {useEffect, useState} from 'react';
import {Box, Spacer} from 'ink';
import {Spinner} from '@inkjs/ui';
import logger from '../Tools/logconfig.js';
import { executeFunction } from '../function/executetoolbot.js';
import {format} from 'date-fns';


function parseResponse(response) {
	if (!response) {
		logger.error('ChatBot响应为空');
		consoleError('ChatBot响应为空');
		return {
			expression: undefined,
			messages: ["false"],
			needTool: false,
		};
	}
	try {
		// 1. 提取表情
		const regex = /\[([^[\]]*)\]/;
		const match = response.match(regex);
		const bracketContent = match ? match[1] : null;
		logger.info(`提取到表情：[${bracketContent}]`);
		// 2. 提取操作
		let cleanText = response.replace(regex, '').trim();
		const needTool = cleanText.endsWith('@');
		if (needTool) {
			cleanText = cleanText.slice(0, -1);
			logger.info('检测到需要执行操作');
		}
		return {
			expression: bracketContent, // 单个方括号内的内容（字符串或 null）
			messages: cleanText.trim().split('$'), // 去掉方括号后的文本
			needTool: needTool, // 要调用工具
		};
	} catch (error) {
		logger.error('解析ChatBot响应失败', error.code + error.stack);
		return undefined;
	}
}

let characterName = Args.flags.character;
let character = new ChatBotAgent(
	process.env.DEFAULT_MODULE_NAME,
	Args.flags.character,
);
try {
	character.loadChatHistory();
	// character.reactNow();
}catch (error) {
	logger.error(
		'加载聊天记录失败，可能是第一次使用角色',
		error.code + error.stack,
	);
}

let expressionLast = '';

const callToolBot = new CallToolAgent(process.env.CALL_TOOL_MODULE_NAME);
/**
 * 尝试调用工具，直到调用成功或达到最大尝试次数
 * 一定要注意清除聊天记录
 * @param {string} userDemand - 用户的需求
 * @returns {Promise<{result: boolean, data: Array<{arg: string, value: string}>}>} - 调用结果
 * @example
 * const result = await callToolFunction('launchApplication', 'Chrome');
 * console.log(result);
 * // {
 * //     result: true,
 * //     data: [{arg: "path", value: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"}],
 * // }
 */
async function callToolNeedClear(userDemand) {



	let result = undefined;
	const userDemandBackUp = userDemand;
	for (
		let i = 0;
		i < Number(process.env.TOOL_MAX_RETRY_TIMES) && !result;
		i++
	) {
		const response = await callToolBot.sendMessage(userDemand);
		const functionName = JSON.parse(response)?.toolName;
		if (!functionName) {
			result = false;
			break;
		}
		logger.info(`准备调用工具：${functionName}`);
		/** 该警告是因为解释器不知道映射后的函数是否是异步的，但我们要确保映射后的函数是异步即可 */
		result = await executeFunction(functionName, userDemandBackUp);
		if (!result.result) {
			userDemand = result.messages;
			logger.warn(`调用工具失败，准备重试第${i + 1}次`);
		}
	}
	// callToolBot.clearChatHistorySaveSystem();
	consoleAction(result.result, result.data, result.message);

	return result.result
		? result
		: {
				result: false,
				data: [],
				// For character
				message: '找不到做这个操作的工具，自己还不会',
		  };
}
function SearchQuery() {
	// 用户输入状态
	const [userInput, setUserInput] = useState('');
	// 终端尺寸状态
	const [screenSize, setScreenSize] = useState({
		x: termSize().columns,
		y: termSize().rows,
	});
	// 回复状态
	const [responseing, setResponseing] = useState(false);
	let responseingForLogic = false;
	function manageResponseing(value) {
		responseingForLogic = value;
		setResponseing(responseingForLogic);
		// console.log("设置responseing",responseingForLogic);
	}
	// 执行状态
	const [executing, setExecuting] = useState(false);
	let executingForLogic = false;
	function manageExecuting(value) {
		executingForLogic = value;
		setExecuting(executingForLogic);
	}
	// 
	async function callDialog(message = '', tempMessage = '', needToolHand = true) {
		if (message !== '') {
			console.log(ChatBubble(message, true, characterName, true));
		}

		// 内容正在生成
		manageResponseing(true);
		let response = await character.sendMessage(message, tempMessage);
		logger.info(characterName + '响应' + response);
		manageResponseing(false);
		// 解析Chat生成内容
		const result = parseResponse(response);
		if (!result) {
			consoleError('解析ChatBot响应失败');
			return;
		}
		const { expression, messages, needTool } = result;
		if (messages[0] === 'false') {
			return;
		}
		let beforeReactNow = true;
		// 异步执行操作
		if (needTool && needToolHand) {
			logger.info('开始执行操作');
			manageExecuting(true);
			callToolNeedClear("user:" + message + '\n' + " bot:" + messages.join('\n')).then(async result => {
				manageExecuting(false);
				beforeReactNow = false;
				manageResponseing(true);
				await callDialog(
					'',
					`操作执行${result.result ? '成功' : '失败'}了${
						result.message
					}回应用户，此次回应不需要@`,
					false);
				manageResponseing(false);
				beforeReactNow = true;
			});
		}
		// 打印消息
		manageResponseing(true);
		await consoleChat(messages, characterName, expression, expressionLast);
		expressionLast = expression;
		if (beforeReactNow) {
			manageResponseing(false);
		}
	}
	// 初始化问候
	// 处理输入确认
	const handleSubmit = async submittedValue => {
		// 1. 空输入返回
		if (
			submittedValue.trim() === '' ||
			responseingForLogic ||
			executingForLogic
		) {
			return;
		}
		// 更新UI
		setUserInput('');
		callDialog(submittedValue);
	};
	/** 监听窗口尺寸变化 */
	useEffect(() => {
		function handleScreenSizeChange() {
			setScreenSize({
				x: termSize().columns,
				y: termSize().rows,
			});
		}
		process.stdout.on('resize', handleScreenSizeChange);

		return () => {
			process.stdout.off('resize', handleScreenSizeChange);
		};
	}, []);
	/** 保存历史记录 */
	useEffect(() => {
		// 组件卸载时，将chatHistory保存到localStorage
		return () => {
			character.saveChatHistory();
			character.addDeveloperMessage("用户退出了聊天，时间" + format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
		};
	}, []);

	useEffect(() => {
		// 组件装载后执行某个操作
		function afterMount() {
			// TODO: 在这里执行某个操作
			callDialog('', '用户已进入聊天，请你做出回应，不要每次都回复一样的话，可以自己创造一些', false);
		}
		// 只在组件装载后执行一次
		afterMount();
	}, []);

	return (
		<Box width={screenSize.x * 0.9} flexDirection="column">
			<Box gap={1}>
				{responseing && (
					<Box flexDirection="column">
						<Box borderStyle={'round'}>
							<Spinner label=" 对方打字中..." />
						</Box>
						<Spacer />
					</Box>
				)}
				{executing && (
					<Box flexDirection="column">
						<Box
							borderColor={'yellowBright'}
							borderStyle={'round'}
							// width={`${character}尝试执行操作中...`.length + 4}
						>
							<Spinner label={`${characterName}尝试执行操作中...`} />
						</Box>
						<Spacer />
					</Box>
				)}
			</Box>
			<ControlledTextInput
				width={'100%'}
				value={userInput}
				placeholder="Input text here ..."
				onSubmit={value => handleSubmit(value)}
				onChange={value => {
					setUserInput(value);
				}}
				size={screenSize}
				canSubmit={!responseing}
			/>
			{/* ({Init()}) */}
		</Box>
	);
}

export default SearchQuery;
