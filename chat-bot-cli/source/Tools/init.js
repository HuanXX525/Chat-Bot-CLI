import meow from 'meow';

const Args = meow(
	`
	Usage
	  $ chat-bot-cli <character>

	Options
	  --character, -c  角色名称

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
		},
	},
);

// console.log(Args.flags.character)

export default Args;
