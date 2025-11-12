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
	  --maxHistoryLength, -l  最大聊天记录长度，默认20000，单位为字符（非tokens）
	  --summaryLength, -s  历史记录超出长度后会进行历史总结纳入记录，此参数指明总结多少条消息，默认30条
	  --config  重新进入配置阶段，配置项相关参数

	Examples
	  $ chat-bot-cli -c test
	
	Note
	  若想自定义角色请根据Project/Characters文件夹下已有的模板自行进行复制修改，启动时指定的角色名称要和文件夹同名
	  关于表情，因为并不是所有图片转化的效果都很好，因此只能是已经提前转好的txt文件
	  转表情的工具使用的是https://github.com/TheZoraiz/ascii-image-converter，大家可以自行下载使用
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
				default: 20000,
				alias: 'l',
			},
			summaryLength: {
				type: 'number',
				default: 30,
				alias: 's',
			},
			config: {
				type: 'boolean',
				default: false,
			},
		},
	},
);

// console.log(Args.flags.character)

export default Args;