import {ControlledTextInput} from './input.js';
import termSize from 'term-size';
import {ChatBotAgent} from '../Tools/agent.js';
import ChatBubble from './chatbubble.js';
import Args from '../Tools/init.js'
import React, {useEffect, useState} from 'react';
import {Box, Spacer} from 'ink';
import { Spinner } from '@inkjs/ui';
import logger from '../Tools/logconfig.js';
import { getDirectSubDirFiles, readTxtFile } from '../Tools/fileio.js';
import { getRandomInt } from '../Tools/utils.js';
import boxen from 'boxen';
import path from 'path';

function parseResponse(response) {
	// 匹配唯一的方括号对，捕获内部内容（非贪婪模式，确保只匹配一对）
	const regex = /\[([^[\]]*)\]/;
	// 执行一次匹配
	const match = response.match(regex);
	// 提取方括号内的内容（若存在）
	const bracketContent = match ? match[1] : null;
	logger.info(`提取到表情：[${bracketContent}]`)
	// 移除方括号及其内容，得到清理后的文本
	const cleanText = response.replace(regex, '').trim();

	return {
		expression: bracketContent, // 单个方括号内的内容（字符串或 null）
		messages: cleanText.trim().split("$"), // 去掉方括号后的文本
	};
}

let characterName = Args.flags.character;
let character = new ChatBotAgent(
	process.env.DEFAULT_MODULE_NAME,
	Args.flags.character,
);
let expressionLast = "";

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
    }
	// 处理输入确认
	const handleSubmit =  async submittedValue => {
		if (submittedValue.trim() === '' || responseingForLogic) {
			return;
		}
        setUserInput('');
        console.log(ChatBubble(submittedValue, true, characterName, true));

        
        manageResponseing(true);
        let response = await character.sendMessage(submittedValue);
		manageResponseing(false);
		// console.log(response)
		const {expression, messages} = parseResponse(response);

		for (let i = 0; i < messages.length; i++) {
			manageResponseing(!responseing);
			const waitTime = messages[i].length * 0.1 * 1000;
			await new Promise(resolve => setTimeout(resolve, waitTime));
			console.log(ChatBubble(messages[i], false, characterName, i === 0));
		}
		/** 打印表情 */
		try {
			if (expression !== expressionLast) {
				await new Promise(resolve => setTimeout(resolve, 1000));
				const expressionPath = path.join(process.env.ROOT_PATH, "Characters", characterName, "Expression", expression);
				const files = getDirectSubDirFiles(expressionPath);
				const expressionIndex = getRandomInt(0, files.length - 1);
				const expressionFile = path.join(expressionPath, files[expressionIndex]);
				// console.log(expressionFile);
				console.log(boxen(readTxtFile(expressionFile).trimEnd(), { borderStyle: "round", title: characterName }));
				expressionLast = expression;
			}
		} catch (error) {
			logger.error("打印表情失败" + error);
		}

		manageResponseing(false);
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

	return (
		<Box width={screenSize.x * 0.9} flexDirection="column">
            {responseing && (
                <Box flexDirection='column'>
                    <Box borderStyle={"round"} width={20}>
                        <Spinner label=" 对方打字中..." />
                    </Box>
                    <Spacer/>
                </Box>
			)}
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
		</Box>
	);
}

export default SearchQuery;
