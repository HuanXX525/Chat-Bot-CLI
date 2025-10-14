import { ExecuteToolAgent } from "../Tools/agent.js";
import logger from "../Tools/logconfig.js";
import launchApplication from "./WIN/launchapplication.js";

const nameToFunction = new Map();
function registerFunction(name, func) {
	logger.info("注册函数:" + name);
	nameToFunction.set(name, func);
}

registerFunction("launchApplication", launchApplication);

const executeToolBot = new ExecuteToolAgent(
	process.env.TOOL_EXECUTE_MODULE_NAME
);

/**
 * Parse a string to extract a valid JSON substring.
 * @param {string} string - The string to parse.
 * @returns {string} A valid JSON substring or an empty string if no valid JSON is found.
 * @example
 * const jsonString = parseJSON('This is a { "key": "value" } string');
 * console.log(jsonString); // { "key": "value" }
 */
function parseJSON(string){
	const jsonMatch = string.match(/{[\s\S]*}/);
	const pureJsonStr = jsonMatch ? jsonMatch[0] : '';
	return pureJsonStr;
}

/**
 * 执行注册的函数
 * @param {string} name - 函数名称
 * @param {string} userDemand - 用户的需求
 * @returns {Object} {
 *     result: boolean,
 *     data: Array<{arg: string, value: string}>,
 *     message: string}
 * @example
 * const result = executeFunction('launchApplication', 'Chrome');
 * console.log(result);
 * // {
 * //     result: true,
 * //     data: [{arg: "path", value: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"}],
 * //     message: "应用程序启动成功"
 * // }
 */
async function executeFunction(name, userDemand) {
	const func = nameToFunction.get(name);
	if (func) {
		try{
			return await func(userDemand);
		} catch (err) {
			logger.error("执行" + name + "失败", err);
			executeToolBot.clearChatHistorySaveSystem();
		}
	} else {
		logger.warn("未能找到函数:" + name);
		return {
			result: false,
			data: [],
			message: `你提供的工具名${name}不能与列表中的任何一项匹，请尝试重新生成`,
		};
	}
}

export default executeToolBot;
export { registerFunction, executeFunction, parseJSON };
