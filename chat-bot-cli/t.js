import { readJsonFile } from "./source/Tools/fileio.js";




// console.log(process.env);

const jsonPath = 'D:/Desktop/FILE/ChatBot/chat-bot-cli/Project/ChatConfig.json';

const chatConfig = readJsonFile(jsonPath);

console.log(chatConfig?.AgentSetting);