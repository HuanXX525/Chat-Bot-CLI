import boxen from 'boxen';
import chalk from 'chalk';
import { format } from 'date-fns';
import path from 'path';
import { getDirectSubDirFiles, readTxtFile } from '../Tools/fileio.js';
import logger, { getLogFilePath } from '../Tools/logconfig.js';
import { getRandomInt } from '../Tools/utils.js';
// import boxen from 'boxen';

function consoleError(message) {
	console.log(
		boxen(message + `\n⚠️请查看Log文件 ${getLogFilePath()}`, {
			padding: {left: 1, right: 1},
			borderColor: 'red',
			borderStyle: 'double',
			title: 'developer',
		}),
	);
}

async function consoleChat(messages, characterName, expression, expressionLast) {

	/** 打印表情 */
	try {
		if (expression !== expressionLast) {
			// await new Promise(resolve => setTimeout(resolve, 1000));
			const expressionPath = path.join(
				process.env.ROOT_PATH,
				'Characters',
				characterName,
				'Expression',
				expression,
			);
			const files = getDirectSubDirFiles(expressionPath);
			const expressionIndex = getRandomInt(0, files.length - 1);
			const expressionFile = path.join(
				expressionPath,
				files[expressionIndex],
			);
			// console.log(expressionFile);
			console.log(
				boxen(readTxtFile(expressionFile).trimEnd(), {
					borderStyle: 'round',
					title: characterName,
				}),
			);
			expressionLast = expression;
		}
	} catch (error) {
		logger.error('打印表情失败' + error);
	}
	// 打印聊天内容
	for (let i = 0; i < messages.length; i++) {
		// manageResponseing(!responseing);
		const waitTime = messages[i].length * 0.1 * 1000;
		await new Promise(resolve => setTimeout(resolve, waitTime));
		console.log(ChatBubble(messages[i], false, characterName, i === 0));
	}
}

function consoleAction(result, data, message) {
	message = (result ? "✅" : "❌") + ' ' + message;
	if(data?.length > 0) {
		message += "\n" + data.map(item => item.arg + ": " + item.value).join("\n");
	}
	
	console.log(boxen(message, {
		padding: {left: 1, right: 1},
		borderColor: result ? 'green' : 'red',
		borderStyle: 'double',
		title: 'developer',
	}));

} //consoleAction

function ChatBubble(content, isUser, characterName, needTime) {
	const time = chalk.gray(format(new Date(), 'yyyy-MM-dd HH:mm:ss')) + '\n';

	return (needTime
		? time
		: '') +
				boxen(content, {
					padding: {left: 1, right: 1},
					borderStyle: 'round',
					borderColor: isUser ? 'blue' : 'green',
					title: isUser ? '你' : characterName,
				});
}

export default ChatBubble;
export { consoleAction, consoleChat, consoleError };

