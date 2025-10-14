import meow from 'meow';

const Args = meow(
	`
	Usage
	  $ chat-bot-cli <character> <restoreChatHistory>

	Options
	  --character, -c  角色名称
	  --restoreChatHistory, -r  是否恢复聊天记录，默认不恢复，不能完全恢复（操作结果会丢失）

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
		},
	},
);

// console.log(Args.flags.character)

export default Args;
