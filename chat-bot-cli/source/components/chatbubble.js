import chalk from 'chalk';
import {format} from 'date-fns';
import boxen from 'boxen';
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
