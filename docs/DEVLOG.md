# 开发日志

## 技术选型

### 核心技术栈

- JavaScript 框架 **React**
  - 理由：我比较熟悉，并且该框架很流行
  - 优势：生态好、JSX 很灵活
  - 劣势：有点臃肿，一个 React 能让锁文件多几千行；学习曲线不是很平缓，渲染、Hook 等机制对于初学者来说过于神秘
- 编程语言 **TypeScript**
  - 理由：我认为这是行业标准，并且我很喜欢
  - 优势：编译期就可以发现大多数错误，配合 IDE 有着非常好的开发体验
  - 劣势：项目初期需要额外工作，可能有点麻烦
- 打包器 **Vite**
  - 理由：我认为这也是行业标准，并且我比较熟悉
  - 优势：配置简单、速度快、有热模块替换等，开发体验非常好，用过就忘不了
  - 劣势：暂时想不到有什么劣势

### 本地开发环境

- JavaScript 运行时 nodejs
- 包管理器 npm
- 编辑器 vscode
- API 端点 ollama

### 辅助工具

- 静态检查 eslint
- 代码格式化 prettier
- 跨平台环境变量 cross-env

### 第三方库

- 模拟数据 msw
- Markdown 渲染 react-markdown
- 代码高亮 react-syntax-highlighter

## MVP 功能边界

1. **基础对话界面**
   - 渲染对话区域，支持用户与 AI 的消息气泡展示。
   - 区分用户和 AI 消息样式（包括头像、角色名称）。
   - 对话区域自动滚动至最新消息。

2. **消息输入与发送**
   - 支持多行文本输入框。
   - 支持点击发送按钮或按 Enter 键发送消息。
   - 发送后清空输入框。

3. **AI 回复模拟**
   - 发送用户消息后，立即显示 AI 加载状态。
   - 模拟 AI 回复，或者本地运行 ollama 服务。

4. **消息状态管理**
   - 管理消息的发送状态：loading（加载中）、sent（已发送）、error（发送失败）。
   - 发送失败时显示错误提示。

## 核心数据结构

消息数据结构如下

```typescript
export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string // 唯一标识
  role: ChatRole // 角色
  content: string // 消息内容
  timestamp: number // 时间戳
  isFinished?: boolean // 回复是否完成
  isError?: boolean // 回复是否出错
}
```

对话流的类型就是 `Message[]`

## 开发流程

### 初始化项目

新建项目并安装依赖

```sh
npm create vite@latest
npm install
```

安装依赖时自动生成了锁文件。之后还要再固定住 nodejs 的版本

```sh
echo "24.11.1" > .nvmrc
```

模板中缺少了格式化工具。按照 [prettier 官方文档](https://prettier.io/docs/install)的说明安装并完成配置

```sh
npm install --save-dev --save-exact prettier
node --eval "fs.writeFileSync('.prettierrc','{}\n')"
node --eval "fs.writeFileSync('.prettierignore','# Ignore\n')"
# 然后修改 .prettierrc 和 .prettierignore 文件，再格式化代码
npx prettier . --write
```
