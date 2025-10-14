import { CallToolAgent } from "./agent";

const callToolBot = new CallToolAgent(process.env.CALL_TOOL_MODULE_NAME);

function callToolFunction(userDemand) {
    
    const toolName = callToolBot.sendMessage(userDemand);

    
    toolFunction();
}