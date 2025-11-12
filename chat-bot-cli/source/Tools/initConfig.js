import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';

// 获取当前模块的绝对路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义.env文件路径
const envFilePath = path.join(__dirname, '../../.env');

// 检查API密钥是否存在
function checkApiKey() {
    if (!fs.existsSync(envFilePath)) {
        return false;
    }
    
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
        if (line.startsWith('OPENAI_API_KEY=')) {
            const apiKey = line.split('=')[1];
            return apiKey.trim() !== '';
        }
    }
    
    return false;
}

// 更新.env文件中的键值对
function updateEnvFile(key, value) {
    // 如果.env文件不存在，创建一个空文件
    if (!fs.existsSync(envFilePath)) {
        fs.writeFileSync(envFilePath, '');
    }
    
    // 读取现有的.env文件内容
    let envContent = fs.readFileSync(envFilePath, 'utf8');
    const lines = envContent.split('\n');
    
    // 查找并更新键值对
    let found = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith(key + '=')) {
            lines[i] = `${key}=${value}`;
            found = true;
            break;
        }
    }
    
    // 如果键不存在，添加新的键值对
    if (!found) {
        lines.push(`${key}=${value}`);
    }
    
    // 写入更新后的内容
    envContent = lines.join('\n');
    fs.writeFileSync(envFilePath, envContent);
}

// 获取.env文件中指定键的值
function getEnvValue(key) {
    if (!fs.existsSync(envFilePath)) {
        return '';
    }
    
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
        if (line.startsWith(key + '=')) {
            return line.split('=').slice(1).join('=');
        }
    }
    
    return '';
}

// 引导用户配置API密钥和基础URL（初始化配置）
async function configureEnv() {
    console.log('欢迎使用聊天机器人！这是您第一次使用，需要进行初始化配置。');
    
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'apiKey',
            message: '请输入您的API密钥(*必须):',
            validate: function (input) {
                return input.trim() !== '' || 'API密钥不能为空';
            }
        },
        {
            type: 'input',
            name: 'baseUrl',
            message: '请输入API基础URL(*必须和APIKEY配对):',
            default: 'https://api.kourichat.com/v1/'
        }
    ]);
    
    // 更新.env文件中的键值对
    updateEnvFile('OPENAI_API_KEY', answers.apiKey);
    updateEnvFile('OPENAI_API_BASE_URL', answers.baseUrl);
    
    console.log('配置已保存到.env文件。');
}

// 完整的.env配置（用于--config启动）
async function configureEnvFull() {
    console.log('=== .env 文件配置 ===');
    console.log('您可以选择配置以下项目，直接回车跳过某项配置');
    
    const envConfig = [
        {
            type: 'input',
            name: 'apiKey',
            message: 'API密钥 (OPENAI_API_KEY):',
            default: getEnvValue('OPENAI_API_KEY')
        },
        {
            type: 'input',
            name: 'baseUrl',
            message: 'API基础URL (OPENAI_API_BASE_URL):',
            default: getEnvValue('OPENAI_API_BASE_URL') || 'https://api.kourichat.com/v1/'
        },
        {
            type: 'input',
            name: 'defaultModule',
            message: '默认对话模型 (DEFAULT_MODULE_NAME):',
            default: getEnvValue('DEFAULT_MODULE_NAME') || 'doubao-1.5-pro-32k'
        },
        {
            type: 'input',
            name: 'callToolModule',
            message: '调用工具模型 (CALL_TOOL_MODULE_NAME):',
            default: getEnvValue('CALL_TOOL_MODULE_NAME') || 'doubao-1.5-pro-32k'
        },
        {
            type: 'input',
            name: 'toolExecuteModule',
            message: '工具执行模型 (TOOL_EXECUTE_MODULE_NAME):',
            default: getEnvValue('TOOL_EXECUTE_MODULE_NAME') || 'gpt-4o-mini'
        },
        {
            type: 'input',
            name: 'chatHistorySummary',
            message: '聊天历史总结模型 (CHAT_HISTORY_SUMMARY_AGENT):',
            default: getEnvValue('CHAT_HISTORY_SUMMARY_AGENT') || 'doubao-1.5-pro-32k'
        },
        {
            type: 'input',
            name: 'logPath',
            message: '日志路径(并不是绝对路径，相对于项目根目录/Project) (LOG_PATH):',
            default: getEnvValue('LOG_PATH') || 'Log'
        }
    ];
    
    const answers = await inquirer.prompt(envConfig);
    
    // 更新.env文件中的键值对
    if (answers.apiKey) updateEnvFile('OPENAI_API_KEY', answers.apiKey);
    if (answers.baseUrl) updateEnvFile('OPENAI_API_BASE_URL', answers.baseUrl);
    if (answers.defaultModule) updateEnvFile('DEFAULT_MODULE_NAME', answers.defaultModule);
    if (answers.callToolModule) updateEnvFile('CALL_TOOL_MODULE_NAME', answers.callToolModule);
    if (answers.toolExecuteModule) updateEnvFile('TOOL_EXECUTE_MODULE_NAME', answers.toolExecuteModule);
    if (answers.chatHistorySummary) updateEnvFile('CHAT_HISTORY_SUMMARY_AGENT', answers.chatHistorySummary);
    if (answers.rootPath) updateEnvFile('ROOT_PATH', answers.rootPath);
    if (answers.logPath) updateEnvFile('LOG_PATH', answers.logPath);
    if (answers.maxRetryTimes) updateEnvFile('TOOL_MAX_RETRY_TIMES', answers.maxRetryTimes);
    
    console.log('配置已保存到.env文件。');
}

// 配置ChatConfig.json（初始化配置）
async function configureChatConfig() {
    const chatConfigPath = path.join(process.env.ROOT_PATH, 'ChatConfig.json');
    if (!fs.existsSync(chatConfigPath)) {
        console.log('ChatConfig.json文件不存在。');
        return;
    }
    
    const chatConfig = JSON.parse(fs.readFileSync(chatConfigPath, 'utf8'));
    
    console.log('现在需要配置ChatConfig.json中的以下项目：');
    
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'appScanDir',
            message: '请输入可被AI启动的应用程序扫描目录(多个目录用逗号分隔,扫描深度5层):'
        },
        {
            type: 'input',
            name: 'browserFavPath',
            message: '请输入浏览器导出的收藏夹文件路径(多个路径用逗号分隔):'
        }
    ]);
    
    chatConfig.ApplicationScanDir = answers.appScanDir.split(',').map(dir => dir.trim()).filter(dir => dir !== '');
    chatConfig.BrowserFavouritePath = answers.browserFavPath.split(',').map(path => path.trim()).filter(path => path !== '');
    
    fs.writeFileSync(chatConfigPath, JSON.stringify(chatConfig, null, 4));
    
    console.log('ChatConfig.json配置已更新。');
}

// 完整的ChatConfig.json配置（用于--config启动）
async function configureChatConfigFull() {
    const chatConfigPath = path.join(process.env.ROOT_PATH, 'ChatConfig.json');
    if (!fs.existsSync(chatConfigPath)) {
        console.log('ChatConfig.json文件不存在。');
        return;
    }
    
    const chatConfig = JSON.parse(fs.readFileSync(chatConfigPath, 'utf8'));
    
    console.log('=== ChatConfig.json 文件配置 ===');
    console.log('您可以选择配置以下项目，直接回车跳过某项配置');
    
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'appScanDir',
            message: '应用程序扫描目录 (ApplicationScanDir) (多个目录用逗号分隔):',
            default: Array.isArray(chatConfig.ApplicationScanDir) ? chatConfig.ApplicationScanDir.join(', ') : ''
        },
        {
            type: 'input',
            name: 'browserFavPath',
            message: '浏览器收藏夹路径 (BrowserFavouritePath) (多个路径用逗号分隔):',
            default: Array.isArray(chatConfig.BrowserFavouritePath) ? chatConfig.BrowserFavouritePath.join(', ') : ''
        }
    ]);
    
    // 只有当用户输入了新值时才更新配置
    if (answers.appScanDir !== undefined) {
        chatConfig.ApplicationScanDir = answers.appScanDir.split(',').map(dir => dir.trim()).filter(dir => dir !== '');
    }
    if (answers.browserFavPath !== undefined) {
        chatConfig.BrowserFavouritePath = answers.browserFavPath.split(',').map(path => path.trim()).filter(path => path !== '');
    }
    
    fs.writeFileSync(chatConfigPath, JSON.stringify(chatConfig, null, 4));
    
    console.log('ChatConfig.json配置已更新。');
}

// 主配置函数（用于--config启动）
async function configureAll() {
    console.log('欢迎使用聊天机器人配置工具！');
    console.log('您可以选择配置以下项目，直接回车跳过某项配置');
    
    let continueConfig = true;
    while (continueConfig) {
        const { configChoice } = await inquirer.prompt([
            {
                type: 'list',
                name: 'configChoice',
                message: '请选择要配置的项目:',
                choices: [
                    { name: '.env 文件配置', value: 'env' },
                    { name: 'ChatConfig.json 文件配置', value: 'chatConfig' },
                    { name: '完成配置', value: 'done' }
                ]
            }
        ]);
        
        switch (configChoice) {
            case 'env':
                await configureEnvFull();
                break;
            case 'chatConfig':
                await configureChatConfigFull();
                break;
            case 'done':
                continueConfig = false;
                break;
        }
    }
    
    console.log('配置已完成！');
}

export { checkApiKey, configureEnv, configureChatConfig, configureAll };