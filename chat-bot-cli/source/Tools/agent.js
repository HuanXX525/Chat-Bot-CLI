import logger from "./logconfig.js";
import { Agent } from "./apiconfig.js";
import { readJsonFile, readTxtFile,getDirectSubDirNames } from "./fileio.js";
import path from "path";
import fs from "fs";
import { assert } from "console";
import msgpack from "@msgpack/msgpack";

class ChatMessage {
	/**
	 * Constructor for ChatMessage
	 * @param {string} systemContent - Initial system message
	 * @param {number} [maxByteConstraint=3000] - Maximum byte size of chat history messages
	 */
	constructor(systemContent = '', maxByteConstraint = 3000) {
		if (systemContent === '') {
			this.chatHistory = [];
		} else {
			this.chatHistory = [{role: 'system', content: systemContent}];
		}
		this.chatHistoryRestriction = maxByteConstraint;
		this.systemContentIndex = 0;
		logger.info('消息初始化完成');
	}

	addUserMessage(userContent) {
		this.chatHistory.push({role: 'user', content: userContent});
	}

	addAssistantMessage(assistantContent) {
		this.chatHistory.push({role: 'assistant', content: assistantContent});
	}

	getChatHistory() {
		return this.chatHistory;
	}

	addDeveloperMessage(message) {
		this.chatHistory.push({
			role: 'user',
			content: '[Developer Message]' + message,
		});
	}

	/**
	 * 保存聊天记录到二进制文件（排除第一条系统消息）
	 * @param {string} filePath - 保存路径
	 * @returns {boolean} 是否成功
	 */
	saveChatHistory(filePath) {
		try {
			// 只保存从索引1开始的记录（排除第一条）
			const dataToSave = {
				chatHistory: this.chatHistory.slice(1)
			};
			const binaryData = msgpack.encode(dataToSave);
			// 同步写入文件（无回调，直接阻塞直到完成）
			fs.writeFileSync(filePath, binaryData);

			logger.info(`聊天记录已保存到 ${filePath}`);
			return true;
		} catch (error) {
			logger.error(`保存聊天记录失败: ${error.message}`);
			return false;
		}
	}

	/**
	 * 从二进制文件加载聊天记录（追加到现有实例）
	 * @param {string} filePath - 文件路径
	 * @returns {boolean} 是否加载成功
	 */
	loadChatHistory(filePath, chatHistory) {
		try {
			// 同步检查文件是否存在（不存在会抛出错误，进入catch）
			fs.accessSync(filePath);
			// 同步读取文件
			const binaryData = fs.readFileSync(filePath);
			const loadedData = msgpack.decode(binaryData);

			// 确保加载的数据是数组，再追加到当前实例的聊天记录中
			if (Array.isArray(loadedData.chatHistory)) {
				this.chatHistory.push(...loadedData.chatHistory);
				// 可选：如果需要维持字节限制，加载后检查
				// this._enforceByteConstraint(); // 如果你之前实现了这个方法
			}

			logger.info(`聊天记录已从 ${filePath} 加载`);
			return true;
		} catch (error) {
			logger.error(`加载聊天记录失败: ${error.message}`);
			return false;
		}
	}
}



class ChatBotAgent extends Agent {
    constructor(modelName, characterName) {
        super(modelName);
        if (!fs.existsSync(path.join(process.env.ROOT_PATH, 'Characters', characterName))) {
            // throw new Error("角色" + characterName + "不存在");
            assert(false, "角色" + characterName + "不存在 \n✨Tip：提供正确的角色名称");
        }
        /** 规则配置 */        
        const chatConfig = readJsonFile(path.join(process.env.ROOT_PATH, 'ChatConfig.json'));
        this.instructions = chatConfig?.AgentSetting; 
        logger.info(`[ChatBot]规则配置加载完成`);
        /** 表情 */
        const expressionDirs = getDirectSubDirNames(path.join(process.env.ROOT_PATH, "Characters", characterName, "Expression"));
        this.instructions += '[Expression]' + expressionDirs.toString() + '[Expression]\n';
        logger.info(`[ChatBot]角色表情${expressionDirs.toString()}加载完成`);
        /** 角色设定 */
        const characterDesign = readTxtFile(path.join(process.env.ROOT_PATH, 'Characters', characterName, 'CharacterDesign.txt'));
        logger.info(`[ChatBot]角色描述${characterName}加载完成`);
        this.instructions += characterDesign
        this.characterName = characterName
        /** 创建聊天信息 */
        this.chatHistory = new ChatMessage(this.instructions);
        logger.info('[ChatBot]Agent' + characterName + '初始化完成');
    }

    async sendMessage(message = "") {
        if (message !== "") {
            this.chatHistory.addUserMessage(message);
        }
        const response = await super.sendMessage(this.chatHistory.getChatHistory());
        this.chatHistory.addAssistantMessage(response);
        return response;
    }

    addDeveloperMessage(message) {
        this.chatHistory.addDeveloperMessage(message);
    }

    async reactNow() {
        return await this.sendMessage();
    }

    saveChatHistory() {
        this.chatHistory.saveChatHistory(path.join(process.env.ROOT_PATH, 'Characters', this.characterName, 'ChatHistory.msgpack'));
    }

    loadChatHistory() {
        this.chatHistory.loadChatHistory(path.join(process.env.ROOT_PATH, 'Characters', this.characterName, 'ChatHistory.msgpack'));
    }
}

class CallToolAgent extends Agent {
	constructor(modelName) {
		super(modelName);
		/** 规则配置 */
		const chatConfig = readJsonFile(
			path.join(process.env.ROOT_PATH, 'ChatConfig.json'),
		);
		this.instructions = chatConfig?.CallToolAgentSetting;
		logger.info(`[CallToolBot]规则配置加载完成`);
		/** 工具描述 */
        this.instructions += chatConfig?.Tools.toString();
		logger.info(`[CallToolBot]工具名称集${chatConfig?.Tools}加载完成`);
		/** 创建聊天信息 */
		this.chatHistory = new ChatMessage(this.instructions);
		logger.info('[CallToolBot]Agent初始化完成');
	}

	async sendMessage(message) {
		this.chatHistory.addUserMessage(message);
		const response = await super.sendMessage(this.chatHistory.getChatHistory());
		this.chatHistory.addAssistantMessage(response);
		return response;
    }
    
    clearChatHistorySaveSystem() {
        this.chatHistory = new ChatMessage(this.instructions);
    }
}

class ExecuteToolAgent extends Agent {
	constructor(modelName) {
		super(modelName);
		/** 规则配置 */
		const chatConfig = readJsonFile(
			path.join(process.env.ROOT_PATH, 'ChatConfig.json'),
		);
		this.instructions = chatConfig?.ExecuteToolAgentSetting;
        logger.info(`[ExecuteToolBot]规则配置加载完成`);
	}

    /**
     * Add tool description to the instructions只有具体使用时才知道什么工具
     * @param {string} toolDescription - Tool description to add to the instructions
     */
    addToolDescription(toolDescription) {
        /** 工具描述 */
        logger.info(`[ExecuteToolBot]工具描述加载完成`);
        /** 创建聊天信息 */
        this.chatHistory = new ChatMessage(this.instructions + toolDescription);
        logger.info('[ExecuteToolBot]Agent初始化完成');
    }

	async sendMessage(message) {
		this.chatHistory.addUserMessage(message);
		const response = await super.sendMessage(this.chatHistory.getChatHistory());
		this.chatHistory.addAssistantMessage(response);
		return response;
	}

	clearChatHistorySaveSystem() {
		this.chatHistory = new ChatMessage(this.instructions);
	}
}

export { ChatBotAgent, CallToolAgent, ExecuteToolAgent };
