# chat-bot-cli

一个基于命令行的聊天机器人程序，支持角色扮演和简单的交互功能。

## 安装

```bash
# 克隆项目
git clone <项目地址>

npm install
# 进入 chat-bot-cli 目录安装依赖
cd chat-bot-cli
npm install

# 构建项目
npm run build

# 如果想在任意位置运行
npm install -g
chat-bot-cli

```

## 首次使用配置

首次运行程序时，引导您进行初始化配置：

1. 输入您的API密钥（必须）
2. 输入API基础URL（必须）
3. 配置应用程序扫描目录
4. 配置浏览器收藏夹路径

## 使用方法

### 基本使用

```bash
# 使用默认角色'test'启动
chat-bot-cli

# 指定角色启动
chat-bot-cli -c <角色名称>
```

### 命令行参数

| 参数 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| --character | -c | 角色名称 | test |
| --restoreChatHistory | -r | 是否恢复聊天记录 | false |
| --maxHistoryLength | -l | 最大聊天记录长度（字符数）超出会触发历史总结 | 20000 |
| --summaryLength | -s | 历史记录总结的消息条数 | 30 |
| --config | 无 | 重新进入配置阶段 | false |

### 示例

```bash
# 使用'test'角色启动
chat-bot-cli -c test

# 使用'丛雨'角色启动并恢复聊天记录
chat-bot-cli -c 丛雨 -r

# 重新配置所有参数
chat-bot-cli --config

# 设置最大聊天记录长度为30000字符
chat-bot-cli -l 30000
```

## 配置说明

### .env 文件配置

程序运行需要以下环境变量配置：

- `OPENAI_API_KEY`: API密钥（必须）
- `OPENAI_API_BASE_URL`: API基础URL（必须）
- `DEFAULT_MODULE_NAME`: 默认对话模型
- `CALL_TOOL_MODULE_NAME`: 调用工具模型
- `TOOL_EXECUTE_MODULE_NAME`: 工具执行模型
- `CHAT_HISTORY_SUMMARY_AGENT`: 聊天历史总结模型
- `LOG_PATH`: 日志路径

### ChatConfig.json 配置

- `ApplicationScanDir`: 应用程序扫描目录（数组格式）
- `BrowserFavouritePath`: 浏览器收藏夹路径（数组格式）

## 角色自定义

1. 在`Project/Characters`文件夹下复制现有角色文件夹
2. 修改文件夹名称为您的角色名
3. 修改`CharacterDesign.txt`文件定义角色特性
4. 在`Expression`文件夹下添加表情文件（txt格式）

## 表情制作

表情文件需要是txt格式，可以使用以下工具生成：
[ascii-image-converter](https://github.com/TheZoraiz/ascii-image-converter)

## 注意事项

1. 若想自定义角色请根据`Project/Characters`文件夹下已有的模板自行进行复制修改，启动时指定的角色名称要和文件夹同名
2. 关于表情，因为并不是所有图片转化的效果都很好，因此只能是已经提前转好的txt文件
3. 聊天记录过长时会自动进行历史总结以控制token数量
