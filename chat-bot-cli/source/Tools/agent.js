import logger from "./logconfig.js";
import { Agent } from "./apiconfig.js";
import { readJsonFile, readTxtFile,getDirectSubDirNames } from "./fileio.js";
import path from "path";
import fs from "fs";

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
}



class ChatBotAgent extends Agent {
    constructor(modelName, characterName) {
        super(modelName);
        if (!fs.existsSync(path.join(process.env.ROOT_PATH, 'Characters', characterName))) {
            throw new Error("角色" + characterName + "不存在");
        }
        /** 规则配置 */        
        const chatConfig = readJsonFile(path.join(process.env.ROOT_PATH, 'ChatConfig.json'));
        this.instructions = chatConfig?.AgentSetting; 
        logger.info(`规则配置加载完成`);
        /** 表情 */
        const expressionDirs = getDirectSubDirNames(path.join(process.env.ROOT_PATH, "Characters", characterName, "Expression"));
        this.instructions += '[Expression]' + expressionDirs.toString() + '[Expression]\n';
        logger.info(`角色表情${expressionDirs.toString()}加载完成`);
        /** 角色设定 */
        const characterDesign = readTxtFile(path.join(process.env.ROOT_PATH, 'Characters', characterName, 'CharacterDesign.txt'));
        logger.info(`角色描述${characterName}加载完成`);
        this.instructions += characterDesign
        /** 创建聊天信息 */
        this.chatHistory = new ChatMessage(this.instructions);
        logger.info("Agent" + characterName + "初始化完成");
    }

    async sendMessage(message) {
        this.chatHistory.addUserMessage(message);
        const response = await super.sendMessage(this.chatHistory.getChatHistory());
        this.chatHistory.addAssistantMessage(response);
        return response;
    }
}

export { ChatBotAgent };
