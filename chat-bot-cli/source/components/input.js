// Tools/MyInput.js
import React, {useState, useEffect} from 'react';
import {Text, Box, useInput} from 'ink';
import chalk from 'chalk';

function ControlledTextInput({
	canSubmit,
	width,
	value: externalValue,
	onChange,
	onSubmit,
	size = {x: undefined},
	placeholder = ' ',
	showCursor = true,
	minWidth = 40,
	cursorColor = 'black',
	cursorBackground = 'white',
	focus = true,
	maxLines = 50,
}) {
	const [internalValue, setInternalValue] = useState(externalValue || '');
	const [lines, setLines] = useState(['']);
	const [cursor, setCursor] = useState({line: 0, position: 0}); // 现在直接存储 {line, position}
	const [allSel, setAllSel] = useState(false);

	const value = externalValue !== undefined ? externalValue : internalValue;
	const setValue = externalValue !== undefined ? onChange : setInternalValue;

	// 将文本转换为行数组
	useEffect(() => {
		const newLines = value.split('\n');
		setLines(newLines);
	}, [value]);

	// 确保光标位置有效
	// useEffect(() => {
	// 	const {line, position} = cursor;
	// 	// console.log('📝 position:', position, "line", line, "lines.length", lines.length);
	// 	if (line >= lines.length) {
	// 		// console.log("📝 linechange");
	// 		setCursor({
	// 			line: lines.length - 1,
	// 			position: Math.min(position, lines[lines.length - 1].length),
	// 		});
	// 	} else if (position > lines[line].length) {
	// 		setCursor({line, position: lines[line].length});
	// 	}
	// }, [lines, cursor]);

	useInput(
		(input, key) => {
			if (!focus) return;
			let {line, position} = cursor;

			/** 一次性多文本 */
			if (input.length > 1 || input.includes('\n')) {
				const transformedInput = input
					.replace(/\t/g, '  ') // 制表符替换为两个空格
					.replace(/\n/g, '\r'); // 换行符替换为\r
				const pasteLines = transformedInput.split('\r');

				let newLines = [''];
				if (allSel === false) {
					newLines = [...lines];
				} else {
					line = 0;
					position = 0;
					setAllSel(false);
				}
				// 在当前行插入粘贴内容
				const currentLine = newLines[line];
				const beforeCursor = currentLine.slice(0, position);
				const afterCursor = currentLine.slice(position);

				newLines[line] = beforeCursor + pasteLines[0];

				// 插入剩余的行
				for (let i = 1; i < pasteLines.length; i++) {
					newLines.splice(line + i, 0, pasteLines[i]);
				}

				// 处理最后一行
				newLines[line + pasteLines.length - 1] += afterCursor;

				// 限制最大行数
				if (newLines.length > maxLines) {
					newLines.splice(maxLines);
				}

				const newValue = newLines.join('\n');
				const newLine = Math.min(line + pasteLines.length - 1, maxLines - 1);
				const newPosition = pasteLines[pasteLines.length - 1].length + position;
				// console.log("📝 newLine:", newLine, "newPosition:", newPosition);
				setLines(newLines);
				setValue?.(newValue);
				setCursor({line: newLine, position: newPosition});
				return;
			}

			/** 换行 */
			if (key.ctrl && input.toLowerCase() === 'n') {
				let newLines = [''];
				if (allSel === false) {
					newLines = [...lines];
				} else {
					line = 0;
					position = 0;
					setAllSel(false);
				}
				const currentLine = newLines[line];

				// 拆分当前行
				const beforeCursor = currentLine.slice(0, position);
				const afterCursor = currentLine.slice(position);

				newLines[line] = beforeCursor;
				newLines.splice(line + 1, 0, afterCursor);

				// 限制最大行数
				if (newLines.length > maxLines) {
					newLines.splice(maxLines);
				}
				// console.log('📝 newLines:', newLines.length);
				setLines(newLines);
				const newValue = newLines.join('\n');
				setValue?.(newValue);
				setCursor({line: line + 1, position: 0});
				return;
			}
			/** Ctrl+A全选 */
			if (key.ctrl && input.toLowerCase() === 'a') {
				// console.log('全选');
				setAllSel(true);
				return;
			}
			/** 回车键 */
			if (key.return) {
				if (canSubmit) {	
					onSubmit?.(value);
					setCursor({line: 0, position: 0});
				}
				return;
			}

			/** 退格键 */
			if (key.backspace || key.delete) {
				if (allSel) {
					setLines(['']);
					setCursor({line: 0, position: 0});
					setValue?.(''); // 清空文本
					return;
				}
				if (position === 0 && line > 0) {
					// 在行首退格，合并到上一行
					const newLines = [...lines];
					const prevLineLength = newLines[line - 1].length;
					newLines[line - 1] += newLines[line];
					newLines.splice(line, 1);

					const newValue = newLines.join('\n');
					setValue?.(newValue);
					setCursor({line: line - 1, position: prevLineLength});
				} else if (position > 0) {
					// 普通删除
					const newLines = [...lines];
					const currentLine = newLines[line];
					newLines[line] =
						currentLine.slice(0, position - 1) + currentLine.slice(position);

					const newValue = newLines.join('\n');
					setValue?.(newValue);
					setCursor({line, position: position - 1});
				}
			} else if (key.upArrow && line > 0) {
				setAllSel(false);
				/**上下箭头 */
				const newPosition = Math.min(position, lines[line - 1].length);
				setCursor({line: line - 1, position: newPosition});
			} else if (key.downArrow && line < lines.length - 1) {
				setAllSel(false);
				const newPosition = Math.min(position, lines[line + 1].length);
				setCursor({line: line + 1, position: newPosition});
			} else if (key.leftArrow) {
				setAllSel(false);
				/** 左右箭头 */
				if (position > 0) {
					// 左移一格
					setCursor({line, position: position - 1});
				} else if (line > 0) {
					// 跳到上一行末尾
					setCursor({line: line - 1, position: lines[line - 1].length});
				}
			} else if (key.rightArrow) {
				setAllSel(false);
				if (position < lines[line].length) {
					// 右移一格
					setCursor({line, position: position + 1});
				} else if (line < lines.length - 1) {
					// 跳到下一行开头
					setCursor({line: line + 1, position: 0});
				}
			} /** 单字符输入 */ else if (input) {
				let newLines = [''];
				if (allSel === false) {
					newLines = [...lines];
				} else {
					line = 0;
					position = 0;
					setAllSel(false);
				}
				const currentLine = newLines[line];
				newLines[line] =
					currentLine.slice(0, position) + input + currentLine.slice(position);

				setLines(newLines);
				setValue?.(newLines.join('\n'));
				setCursor({line, position: position + 1});
			}
		},
		{isActive: focus},
	);

	/** 渲染多行文本 */
	const renderContent = () => {
		const {line: currentLine, position: currentPosition} = cursor;
		const currentLineText = lines[currentLine] || '';

		/** 当前光标所在字符 */
		let cursorChar = ' ';
		if (value === '' && currentLine === 0) {
			cursorChar = placeholder[0] || ' ';
		} else {
			cursorChar =
				currentPosition < currentLineText.length
					? currentLineText[currentPosition]
					: ' ';
		}

		/** 空文本显示placeholder */
		if (value === '' && lines.length === 1 && lines[0] === '') {
			return (
				<Text dimColor>
					{showCursor && (
						<Text color={cursorColor} backgroundColor={cursorBackground}>
							{cursorChar}
						</Text>
					)}
					{placeholder.slice(1)}
				</Text>
			);
		}

		{
			/* 当前行拆分显示光标，其余行直接显示（空行显示空格） */
		}
		return lines.map((lineText, lineIndex) =>
			allSel ? (
				<Text
					key={lineIndex}
					color={cursorColor}
					backgroundColor={cursorBackground}
				>
					{lineText}
				</Text>
			) : (
				<Text key={lineIndex}>
					{lineIndex === currentLine ? (
						<>
							{lineText.slice(0, currentPosition)}
							{showCursor && (
								<Text color={cursorColor} backgroundColor={cursorBackground}>
									{cursorChar}
								</Text>
							)}
							{lineText.slice(currentPosition + 1)}
						</>
					) : lineText === '' ? (
						' '
					) : (
						lineText
					)}
				</Text>
			),
		);
	};

	/** HTML */
	return (
		<Box flexDirection="column" width={width} minWidth={minWidth}>
			<Box flexDirection="row" gap={1} borderStyle={'round'} paddingX={1}>
				<Text>{chalk.blue('❯')}</Text>
				<Box flexDirection="column">{renderContent()}</Box>
			</Box>
			<Text>
				({chalk.red('Ctrl+N换行')} |{ canSubmit?chalk.green('Enter提交'):chalk.gray('Enter提交')}|{' '}
				{chalk.blue('↑↓←→ 移动')} | {chalk.blue('Ctrl+A全选')}) | 行：
				{cursor.line} | 位置: {cursor.position} | 最大行数：{maxLines}
				{/* 全选：{allSel ? '是' : '否'} */}
			</Text>
		</Box>
	);
}

export {ControlledTextInput};
