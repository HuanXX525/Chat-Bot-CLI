import logger from "./logconfig.js";
import { Agent } from "./apiconfig.js";
import { readJsonFile, readTxtFile,getDirectSubDirNames } from "./fileio.js";
import path from "path";
import fs from "fs";
import { assert } from "console";

class ChatMessage {
/**
 * Constructor for ChatMessage
 * @param {string} systemContent - Initial system message
 * @param {number} [maxByteConstraint=3000] - Maximum byte size of chat history messages
 */
    constructor(systemContent = "", maxByteConstraint = 3000) {
        if (systemContent === "") {   
            this.chatHistory = [];
        } else {
            this.chatHistory = [{role: "system", content: systemContent}];
        }
        this.chatHistoryRestriction = maxByteConstraint;
        this.systemContentIndex = 0;
        logger.info("消息初始化完成");
    }

    addUserMessage(userContent) {
        this.chatHistory.push({role: "user", content: userContent});
    }

    addAssistantMessage(assistantContent) {
        this.chatHistory.push({role: "assistant", content: assistantContent});
    }

    getChatHistory() {
        return this.chatHistory;
    }

    addDeveloperMessage(message) {
        this.chatHistory.push({role: "user", content:"[Developer Message]" + message});
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
