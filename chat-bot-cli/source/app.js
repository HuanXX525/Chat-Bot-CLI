import React, {useState, useRef, useEffect} from 'react';
import {Box, Text, useInput, useStdout} from 'ink';
import {TextInput} from '@inkjs/ui';

function App() {
	const {stdout} = useStdout();
	const [inputValue, setInputValue] = useState('');
	const messageCountRef = useRef(0);

	// 使用 ref 来存储消息，避免重新渲染
	const messagesRef = useRef(['系统: 应用启动成功', '系统: 开始聊天吧！']);

	// 初始化：将初始消息输出到终端
	useEffect(() => {
		// 延迟输出，确保 Ink 渲染完成后再输出消息
		setTimeout(() => {
			messagesRef.current.forEach(msg => {
				stdout.write(msg + '\n');
			});
			stdout.write('\n'); // 空行分隔
		}, 100);
	}, []);

	const handleSubmit = message => {
		if (!message.trim()) return;

		messageCountRef.current += 1;
		const newMessage = `用户[${messageCountRef.current}]: ${message}`;

		// 1. 存储消息
		messagesRef.current.push(newMessage);

		// 2. 直接输出到终端（绕过 Ink 的重新渲染）
		stdout.write(newMessage + '\n');

		// 3. 清空输入框
		setInputValue('');

		// 4. 模拟机器人回复
		setTimeout(() => {
			const botMessage = `机器人[${messageCountRef.current}]: 收到你的消息 "${message}"`;
			messagesRef.current.push(botMessage);
			stdout.write(botMessage + '\n');
		}, 500);
	};

	useInput((input, key) => {
		if (key.escape) {
			stdout.write('\n=== 聊天应用已退出 ===\n');
			process.exit(0);
		}

		// Ctrl+L 清屏
		if (key.ctrl && input === 'l') {
			console.clear();
			// 重新输出消息
			setTimeout(() => {
				messagesRef.current.forEach(msg => {
					stdout.write(msg + '\n');
				});
				stdout.write('\n');
			}, 100);
		}
	});

	// Ink 只负责渲染输入界面
	return (
		<Box
			flexDirection="column"
			borderStyle="round"
			borderColor="cyan"
			padding={1}
		>
			<Box marginBottom={1}>
				<Text color="green">💬 输入消息 (Enter发送, ESC退出, Ctrl+L清屏):</Text>
			</Box>
			<Box>
				<TextInput
					value={inputValue}
					onChange={setInputValue}
					onSubmit={handleSubmit}
					placeholder="在这里输入消息..."
				/>
			</Box>
			<Box marginTop={1}>
				<Text color="gray">已发送 {messageCountRef.current} 条消息</Text>
			</Box>
		</Box>
	);
}

export default App;
