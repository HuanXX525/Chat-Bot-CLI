import meow from 'meow';
import { readJsonFile } from './fileio.js';
import path from 'path';
export const configJSON = readJsonFile(path.join(process.env.ROOT_PATH, 'ChatConfig.json'));



const Args = meow(
	`
	Usage
	  $ chat-bot-cli <character> <restoreChatHistory>

	Options
	  --character, -c  角色名称
	  --restoreChatHistory, -r  是否恢复聊天记录，默认不恢复，不能完全恢复（操作结果会丢失）
	  --maxHistoryLength, -l  最大聊天记录长度，默认10000，单位为字符（非tokens）
	  --summaryLength, -s  历史记录超出长度后会进行历史总结纳入记录，此参数指明总结多少条消息，默认50条

	Examples
	  $ chat-bot-cli -c test
`,
	{
		importMeta: import.meta, // This is required
		flags: {
			character: {
				type: 'string',
				alias: 'c',
				default: 'test',
			},
			restoreChatHistory: {
				type: 'boolean',
				default: false,
				alias: 'r',
			},
			maxHistoryLength: {
				type: 'number',
				default: 10000,
				alias: 'l'
			},
			summaryLength: {
				type: 'number',
				default: 50,
				alias: 's'
			}
		},
	},
);

// console.log(Args.flags.character)

export default Args;