# AI 聊天对话应用

本项目使用 React + TypeScript + Vite 进行开发。可阅读开发文档了解更多细节

- [技术选型](./docs/TECHSTACK.md)
- [开发日志](./docs/DEVLOG.md)
- [应用架构](./docs/ARCH.md)
- [实现细节](./docs/IMPL.md)

## 简介

本应用实现了 AI 聊天的 Web 界面，除了基本的聊天功能外，还拥有丰富的特性

- 多会话管理
- 流式回复
- 模型选择

## 运行

运行如下命令启动本地开发服务器，此时默认使用 Mock 模拟数据。

```sh
npm install # 如果未安装依赖
npm run dev
```

## 打包

本项目提供了 2 种打包模式

- 使用 Mock 模拟数据
- 使用本地 Ollama 服务

### Mock 模拟数据

如果需要在打包后使用 Mock 模拟数据，请用如下命令打包

```sh
npm run build:dev
```

然后启动本地 http 服务器，并访问对应的端口

```sh
cd dist
python -m http.server # 默认端口为 8000
# 或者
npx http-server # 默认端口为 8080
```

### 本地 Ollama 服务

如果需要在打包后使用本地 Ollama 服务，请用如下命令打包

```sh
npm run build
```

然后同上启动本地 http 服务器。不过可能还得启动本地的 Ollama 服务器

```sh
ollama serve
```
